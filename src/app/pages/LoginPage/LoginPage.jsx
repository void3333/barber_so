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
    Link,
} from "@mui/material";
import {supabase} from "../../lib/supabase.js";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
        }

        setLoading(false);
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
            <Card sx={{ width: "100%", maxWidth: 420, borderRadius: 4 }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" fontWeight={700}>
                                BarberOS
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Entre para acessar o painel.
                            </Typography>
                        </Box>

                        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={2}>
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
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={22} /> : "Entrar"}
                                </Button>
                            </Stack>
                        </Box>
                        <Typography variant="body2" textAlign="center">
                            Não tem conta? <Link href="/signup" underline="hover">Criar conta</Link>
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}