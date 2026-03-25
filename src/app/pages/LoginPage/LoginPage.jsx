import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Link,
    Stack,
    TextField,
    Typography,
    Chip,
} from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import barberOsLogo from "../.././../assets/barber-os-logo-light.webp";
import { supabase } from "../../lib/supabase.js";

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
                background:
                    "radial-gradient(circle at top left, rgba(196,138,63,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(120,72,24,0.18), transparent 24%), linear-gradient(135deg, #0f0f10 0%, #17181b 48%, #111214 100%)",
                py: { xs: 3, md: 5 },
            }}
        >
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "1.15fr 1fr" },
                        gap: 3,
                        alignItems: "stretch",
                    }}
                >
                    <Card
                        sx={{
                            borderRadius: 6,
                            overflow: "hidden",
                            bgcolor: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <Box
                            sx={{
                                height: "100%",
                                display: "grid",
                                gridTemplateRows: "auto auto 1fr auto",
                                p: { xs: 3, md: 5 },
                                color: "#fff",
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    component="img"
                                    src={barberOsLogo}
                                    alt="BarberOS"
                                    sx={{
                                        width: 300,
                                        height: 100,
                                        objectFit: "contain",
                                        borderRadius: 2,
                                    }}
                                />

                                <Box>
                                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.64)" }}>
                                        Plataforma para barbearias modernas
                                    </Typography>
                                </Box>
                            </Stack>

                            <Box sx={{ mt: 5 }}>
                                <Typography
                                    variant="h2"
                                    fontWeight={800}
                                    sx={{
                                        fontSize: { xs: "2rem", md: "3.2rem" },
                                        lineHeight: 1.05,
                                        maxWidth: 720,
                                    }}
                                >
                                    Sua operação organizada em um painel limpo, rápido e profissional.
                                </Typography>

                                <Typography
                                    variant="body1"
                                    sx={{
                                        mt: 2,
                                        maxWidth: 620,
                                        color: "rgba(255,255,255,0.72)",
                                        fontSize: { xs: "0.98rem", md: "1.02rem" },
                                    }}
                                >
                                    Entre na sua conta para gerenciar agenda, clientes, serviços e o
                                    dia a dia da sua barbearia no BarberOS.
                                </Typography>
                            </Box>

                            <Stack spacing={2.2} sx={{ mt: 5, alignSelf: "start" }}>
                                {[
                                    "Agenda visual e organizada",
                                    "Clientes, serviços e agendamentos em um só lugar",
                                    "Experiência moderna para operação diária",
                                ].map((item) => (
                                    <Stack key={item} direction="row" spacing={1.2} alignItems="center">
                                        <CheckRoundedIcon sx={{ fontSize: 20, color: "#d89b49" }} />
                                        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.78)" }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>

                            <Box sx={{ mt: 4 }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <WorkspacePremiumRoundedIcon sx={{ color: "#c48a3f" }} />
                                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.64)" }}>
                                        Entre e continue de onde parou com seu ambiente já configurado.
                                    </Typography>
                                </Stack>
                            </Box>
                        </Box>
                    </Card>

                    <Card
                        sx={{
                            borderRadius: 6,
                            bgcolor: "#f6f1e8",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
                            overflow: "hidden",
                        }}
                    >
                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={3}>
                                <Box>
                                    <Chip
                                        icon={<LoginRoundedIcon />}
                                        label="Acesso ao painel"
                                        sx={{
                                            mb: 2,
                                            bgcolor: "rgba(196,138,63,0.14)",
                                            color: "#7a4f1f",
                                            fontWeight: 700,
                                        }}
                                    />

                                    <Typography variant="h4" fontWeight={800} sx={{ color: "#161616" }}>
                                        Entrar na conta
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 1, color: "rgba(0,0,0,0.62)" }}
                                    >
                                        Acesse seu ambiente e continue a operação da sua barbearia.
                                    </Typography>
                                </Box>

                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        bgcolor: "#111214",
                                        color: "#fff",
                                        boxShadow: "none",
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={1.2}>
                                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.64)" }}>
                                                Ambiente
                                            </Typography>

                                            <Typography variant="h5" fontWeight={800}>
                                                Painel BarberOS
                                            </Typography>

                                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)" }}>
                                                Login seguro para acessar agenda, clientes, serviços e
                                                indicadores da operação.
                                            </Typography>

                                            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />

                                            <Stack spacing={1}>
                                                {[
                                                    "Acesso à agenda operacional",
                                                    "Gestão de clientes e serviços",
                                                    "Dashboard com visão rápida da operação",
                                                ].map((feature) => (
                                                    <Stack key={feature} direction="row" spacing={1.2} alignItems="center">
                                                        <CheckRoundedIcon sx={{ fontSize: 18, color: "#d89b49" }} />
                                                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)" }}>
                                                            {feature}
                                                        </Typography>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>

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
                                            sx={{
                                                mt: 1,
                                                py: 1.55,
                                                borderRadius: 3,
                                                fontWeight: 800,
                                                textTransform: "none",
                                                fontSize: "1rem",
                                                bgcolor: "#1a1a1a",
                                                color: "#fff",
                                                boxShadow: "none",
                                                "&:hover": {
                                                    bgcolor: "#0f0f10",
                                                    boxShadow: "none",
                                                },
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress size={22} sx={{ color: "#fff" }} />
                                            ) : (
                                                "Entrar"
                                            )}
                                        </Button>

                                        <Typography
                                            variant="body2"
                                            textAlign="center"
                                            sx={{ color: "rgba(0,0,0,0.62)" }}
                                        >
                                            Ainda não tem conta?{" "}
                                            <Link
                                                href="/checkout"
                                                underline="hover"
                                                sx={{ fontWeight: 700, color: "#161616" }}
                                            >
                                                Criar conta
                                            </Link>
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}