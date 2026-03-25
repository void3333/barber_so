import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent, Chip,
    CircularProgress,
    Container,
    Divider,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import barberOsLogo from "../../../assets/barber-os-logo-light.webp";
import { supabase } from "../../lib/supabase.js";

const plans = [
    {
        id: "starter",
        name: "Starter",
        price: "R$ 49/mês",
        description: "Para barbearias enxutas começarem rápido.",
        features: [
            "Agendamentos",
            "Clientes e serviços",
            "Dashboard básico",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: "R$ 99/mês",
        description: "Para operação mais profissional e organizada.",
        features: [
            "Tudo do Starter",
            "Fluxo operacional completo",
            "Melhor gestão da agenda",
        ],
        featured: true,
    },
    {
        id: "premium",
        name: "Premium",
        price: "R$ 149/mês",
        description: "Para quem quer crescer com mais controle.",
        features: [
            "Tudo do Pro",
            "Estrutura pronta para expansão",
            "Base premium para evolução",
        ],
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
                throw barbershopError;
            }

            const { error: membershipError } = await supabase.from("memberships").insert({
                user_id: user.id,
                barbershop_id: barbershopData.id,
                role: "admin",
            });

            if (membershipError) {
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
                    background:
                        "radial-gradient(circle at top, rgba(196,138,63,0.22), transparent 35%), linear-gradient(135deg, #0f0f10 0%, #17181b 50%, #111214 100%)",
                    px: 2,
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress sx={{ color: "#c48a3f" }} />
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)" }}>
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
                                        fontSize: { xs: "2rem", md: "3.4rem" },
                                        lineHeight: 1.05,
                                        maxWidth: 720,
                                    }}
                                >
                                    Venda, organize e opere sua barbearia com uma experiência premium.
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
                                    Escolha seu plano, crie sua conta e entre com tudo pronto para
                                    começar a operar no BarberOS.
                                </Typography>
                            </Box>

                            <Stack
                                spacing={2}
                                sx={{
                                    mt: 5,
                                    alignSelf: "start",
                                }}
                            >
                                {plans.map((plan) => {
                                    const isSelected = selectedPlan === plan.id;

                                    return (
                                        <Box
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan.id)}
                                            sx={{
                                                p: 2.2,
                                                borderRadius: 4,
                                                cursor: "pointer",
                                                transition: "all 0.2s ease",
                                                border: isSelected
                                                    ? "1px solid rgba(196,138,63,0.9)"
                                                    : "1px solid rgba(255,255,255,0.08)",
                                                bgcolor: isSelected
                                                    ? "rgba(196,138,63,0.10)"
                                                    : "rgba(255,255,255,0.03)",
                                                boxShadow: isSelected
                                                    ? "0 0 0 1px rgba(196,138,63,0.18) inset"
                                                    : "none",
                                                "&:hover": {
                                                    transform: "translateY(-1px)",
                                                    borderColor: "rgba(196,138,63,0.55)",
                                                },
                                            }}
                                        >
                                            <Stack
                                                direction={{ xs: "column", md: "row" }}
                                                spacing={2}
                                                justifyContent="space-between"
                                                alignItems={{ xs: "flex-start", md: "center" }}
                                            >
                                                <Box>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="h6" fontWeight={700}>
                                                            {plan.name}
                                                        </Typography>

                                                        {plan.featured && (
                                                            <Chip
                                                                size="small"
                                                                label="Mais escolhido"
                                                                sx={{
                                                                    bgcolor: "#c48a3f",
                                                                    color: "#111",
                                                                    fontWeight: 700,
                                                                }}
                                                            />
                                                        )}
                                                    </Stack>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{ mt: 0.5, color: "rgba(255,255,255,0.64)" }}
                                                    >
                                                        {plan.description}
                                                    </Typography>
                                                </Box>

                                                <Typography
                                                    variant="h6"
                                                    fontWeight={800}
                                                    sx={{ color: isSelected ? "#e2a24d" : "#fff" }}
                                                >
                                                    {plan.price}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    );
                                })}
                            </Stack>

                            <Box sx={{ mt: 4 }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <WorkspacePremiumRoundedIcon sx={{ color: "#c48a3f" }} />
                                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.64)" }}>
                                        Pagamento mock nesta etapa. Fluxo já preparado para refinamento futuro.
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
                                    <Typography variant="h4" fontWeight={800} sx={{ color: "#161616" }}>
                                        Finalizar cadastro
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 1, color: "rgba(0,0,0,0.62)" }}
                                    >
                                        Configure sua conta e ative seu acesso ao BarberOS.
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
                                                Plano selecionado
                                            </Typography>

                                            <Typography variant="h5" fontWeight={800}>
                                                {selectedPlanData?.name}
                                            </Typography>

                                            <Typography variant="h6" fontWeight={700} sx={{ color: "#d89b49" }}>
                                                {selectedPlanData?.price}
                                            </Typography>

                                            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />

                                            <Stack spacing={1}>
                                                {selectedPlanData?.features?.map((feature) => (
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
                                            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Pagar e criar conta"}
                                        </Button>

                                        <Typography variant="body2" textAlign="center" sx={{ color: "rgba(0,0,0,0.62)" }}>
                                            Já tenho uma conta{" "}
                                            <Link
                                                href="/login"
                                                underline="hover"
                                                sx={{ fontWeight: 700, color: "#161616" }}
                                            >
                                                Fazer login
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