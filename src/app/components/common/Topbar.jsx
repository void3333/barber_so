import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Box,
    Button,
    Chip,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import { useAuth } from "../../hooks/useAuth.js";
import { supabase } from "../../lib/supabase.js";

export default function Topbar() {
    const navigate = useNavigate();

    const { profile, user, membership, barbershop } = useAuth();

    const displayName = profile?.full_name || user?.email || "Usuário";

    const roleLabelMap = {
        admin: "Administrador",
        manager: "Gerente",
        barber: "Barbeiro",
        receptionist: "Recepção",
    };

    const membershipName = roleLabelMap[membership?.role] || "Sem cargo";

    const planMetaMap = {
        starter: {
            label: "Plano Starter",
            price: "R$ 49/mês",
        },
        pro: {
            label: "Plano Profissional",
            price: "R$ 99/mês",
        },
        premium: {
            label: "Plano Premium",
            price: "R$ 149/mês",
        },
    };

    const currentPlan = planMetaMap[barbershop?.plan] || {
        label: "Sem plano",
        price: "",
    };

    async function handleLogout() {
        const { error } = await supabase.auth.signOut({ scope: "local" });

        if (error) {
            console.error(error);
            return;
        }

        navigate("/login", { replace: true });
    }

    return (
        <AppBar
            position="static"
            color="inherit"
            elevation={0}
            sx={{
                bgcolor: "#f7f4ee",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "none",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: "78px !important",
                    px: { xs: 2, md: 3 },
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                >
                    <Chip
                        icon={<BadgeRoundedIcon sx={{ fontSize: 18 }} />}
                        label={membershipName}
                        sx={{
                            height: 34,
                            borderRadius: 2.5,
                            fontWeight: 700,
                            bgcolor: "rgba(17,18,20,0.06)",
                            color: "#1a1a1a",
                            "& .MuiChip-icon": {
                                color: "#7a4f1f",
                            },
                        }}
                    />

                    <Chip
                        icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />}
                        label={currentPlan.label}
                        sx={{
                            height: 34,
                            borderRadius: 2.5,
                            fontWeight: 700,
                            bgcolor: "rgba(196,138,63,0.14)",
                            color: "#7a4f1f",
                            border: "1px solid rgba(196,138,63,0.2)",
                            "& .MuiChip-icon": {
                                color: "#c48a3f",
                            },
                        }}
                    />

                    {currentPlan.price && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: "rgba(0,0,0,0.56)",
                                fontWeight: 600,
                            }}
                        >
                            {currentPlan.price}
                        </Typography>
                    )}
                </Stack>

                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                >
                    <Box sx={{ textAlign: "right", minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "rgba(0,0,0,0.5)",
                                lineHeight: 1.1,
                            }}
                        >
                            Bem-vindo
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            fontWeight={800}
                            noWrap
                            sx={{
                                color: "#161616",
                                maxWidth: { xs: 120, sm: 220, md: 280 },
                            }}
                        >
                            {displayName}
                        </Typography>
                    </Box>

                    <Button
                        onClick={handleLogout}
                        variant="outlined"
                        startIcon={<LogoutRoundedIcon />}
                        sx={{
                            borderRadius: 3,
                            textTransform: "none",
                            fontWeight: 700,
                            px: 2,
                            py: 1,
                            color: "#1a1a1a",
                            borderColor: "rgba(0,0,0,0.12)",
                            "&:hover": {
                                borderColor: "rgba(0,0,0,0.24)",
                                bgcolor: "rgba(0,0,0,0.03)",
                            },
                        }}
                    >
                        Sair
                    </Button>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}