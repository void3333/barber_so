import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {supabase} from "../../lib/supabase.js";

const plans = [
    {
        id: "starter",
        name: "Starter",
        price: "R$ 49/mês",
        description: "Para barbearias enxutas começarem rápido.",
    },
    {
        id: "pro",
        name: "Pro",
        price: "R$ 99/mês",
        description: "Para operação mais profissional e organizada.",
    },
    {
        id: "premium",
        name: "Premium",
        price: "R$ 149/mês",
        description: "Para quem quer crescer com mais controle.",
    },
];

const allowedPlans = ["starter", "pro", "premium"];

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

export default function CheckoutPage() {
    const [searchParams] = useSearchParams();

    const [selectedPlan, setSelectedPlan] = useState("pro");
    const [fullName, setFullName] = useState("");
    const [barbershopName, setBarbershopName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [finishingCheckout, setFinishingCheckout] = useState(false);

    useEffect(() => {
        const planFromUrl = searchParams.get("plan");

        if (allowedPlans.includes(planFromUrl)) {
            setSelectedPlan(planFromUrl);
        }
    }, [searchParams]);

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setLoading(true);
        setFinishingCheckout(true);

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
                    plan: selectedPlan,
                })
                .select()
                .single();

            if (barbershopError) {
                console.error("BARBERSHOP ERROR:", barbershopError);
                console.error("BARBERSHOP PAYLOAD:", {
                    name: barbershopName,
                    slug,
                    created_by: user.id,
                    plan: selectedPlan,
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

            setSuccessMessage("Conta criada com sucesso. Redirecionando para o login...");

            setFullName("");
            setBarbershopName("");
            setEmail("");
            setPassword("");

            await supabase.auth.signOut({ scope: "local" });
            window.location.replace("/login");
        } catch (error) {
            setFinishingCheckout(false);
            setErrorMessage(error.message || "Não foi possível concluir o checkout.");
        } finally {
            setLoading(false);
        }
    }

    if (finishingCheckout) {
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
                        Finalizando checkout...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    const selectedPlanData = plans.find((plan) => plan.id === selectedPlan);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "grey.100",
                display: "flex",
                alignItems: "center",
                py: 0,
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={3}>
                    <Box textAlign="center">
                        <Typography variant="h3" fontWeight={700}>
                            Escolha seu plano
                        </Typography>

                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            Finalize seu cadastro e libere seu acesso ao BarberOS.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                        {plans.map((plan) => {
                            const isSelected = selectedPlan === plan.id;

                            return (
                                <Card
                                    key={plan.id}
                                    sx={{
                                        flex: 1,
                                        borderRadius: 4,
                                        border: 2,
                                        borderColor: isSelected ? "primary.main" : "transparent",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setSelectedPlan(plan.id)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={2}>
                                            <Typography variant="h5" fontWeight={700}>
                                                {plan.name}
                                            </Typography>

                                            <Typography variant="h6" color="primary.main" fontWeight={700}>
                                                {plan.price}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                {plan.description}
                                            </Typography>

                                            <Button
                                                variant={isSelected ? "contained" : "outlined"}
                                                fullWidth
                                            >
                                                {isSelected ? "Selecionado" : "Selecionar"}
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="flex-start">
                        <Card sx={{ flex: 2, width: "100%", borderRadius: 4 }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={2}>
                                    <Typography variant="h5" fontWeight={700}>
                                        Dados da conta
                                    </Typography>

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
                                                disabled={loading || finishingCheckout}
                                            >
                                                {loading ? <CircularProgress size={22} /> : "Pagar e criar conta"}
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card sx={{ flex: 1, width: "100%", borderRadius: 4 }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={2}>
                                    <Typography variant="h6" fontWeight={700}>
                                        Resumo
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Plano selecionado
                                    </Typography>

                                    <Typography variant="h5" fontWeight={700}>
                                        {selectedPlanData?.name}
                                    </Typography>

                                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                                        {selectedPlanData?.price}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Pagamento mock. Nenhuma cobrança real será feita nesta etapa.
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}