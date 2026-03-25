import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {supabase} from "../../lib/supabase.js";

function slugify(value) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [barbershopName, setBarbershopName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [finishingSignup, setFinishingSignup] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setLoading(true);
        setFinishingSignup(true);

        try {
            const slug = slugify(barbershopName);

            if (!slug) {
                throw new Error("Informe um nome válido para a barbearia.");
            }

            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                throw signUpError;
            }

            const user = signUpData.user;

            if (!user) {
                throw new Error("Usuário não retornado pelo Supabase.");
            }

            const { error: profileError } = await supabase.from("profiles").insert({
                id: user.id,
                full_name: fullName,
                email,
            });

            if (profileError) {
                console.error("PROFILE ERROR:", profileError);
                throw profileError;
            }

            const { data: barbershopData, error: barbershopError } = await supabase
                .from("barbershops")
                .insert({
                    name: barbershopName,
                    slug,
                    created_by: user.id,
                })
                .select()
                .single();

            if (barbershopError) {
                console.error("BARBERSHOP ERROR:", barbershopError);
                console.error("BARBERSHOP PAYLOAD:", {
                    name: barbershopName,
                    slug,
                    created_by: user.id,
                });
                throw barbershopError;
            }

            const { error: membershipError } = await supabase.from("memberships").insert({
                user_id: user.id,
                barbershop_id: barbershopData.id,
                role: "admin",
            });

            if (membershipError) {
                console.error("MEMBERSHIP ERROR:", membershipError);
                throw membershipError;
            }

            setSuccessMessage("Cadastro realizado com sucesso. Redirecionando para o login...");
            setFullName("");
            setBarbershopName("");
            setEmail("");
            setPassword("");

            await supabase.auth.signOut({ scope: "local" });
            window.location.replace("/login");
        } catch (error) {
            setFinishingSignup(false);
            setErrorMessage(error.message || "Não foi possível concluir o cadastro.");
        } finally {
            setLoading(false);
        }
    }

    if (finishingSignup) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "grey.100",
                    p: 2,
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                        Finalizando cadastro...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                bgcolor: "grey.100",
                p: 2,
            }}
        >
            <Card sx={{ width: "100%", maxWidth: 460, borderRadius: 4 }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" fontWeight={700}>
                                Criar conta
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Cadastre sua barbearia para acessar o sistema.
                            </Typography>
                        </Box>

                        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                        {successMessage && <Alert severity="success">{successMessage}</Alert>}

                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Seu nome"
                                    fullWidth
                                    required
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                />

                                <TextField
                                    label="Nome da barbearia"
                                    fullWidth
                                    required
                                    value={barbershopName}
                                    onChange={(event) => setBarbershopName(event.target.value)}
                                />

                                <TextField
                                    label="E-mail"
                                    type="email"
                                    fullWidth
                                    required
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />

                                <TextField
                                    label="Senha"
                                    type="password"
                                    fullWidth
                                    required
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading || finishingSignup}
                                >
                                    {loading ? <CircularProgress size={22} /> : "Criar conta"}
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}