import { NavLink } from "react-router-dom";
import {
    Box,
    Chip,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Stack,
} from "@mui/material";
import { sidebarRoutes } from "../../routes/SidebarRoutes.jsx";
import { useAuth } from "../../hooks/useAuth.js";

const planLabelMap = {
    starter: "Starter",
    pro: "Profissional",
    premium: "Premium",
};

export default function Sidebar() {
    const { barbershop } = useAuth();

    const shopName = barbershop?.name || "Sem barbearia";
    const planName = planLabelMap[barbershop?.plan] || "Sem plano";

    return (
        <Box
            sx={{
                width: 280,
                minHeight: "100vh",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                background:
                    "linear-gradient(180deg, #111214 0%, #17181b 55%, #0f0f10 100%)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: "auto !important",
                    alignItems: "flex-start",
                    px: 2.5,
                    py: 2.5,
                }}
            >
                <Stack spacing={2} sx={{ width: "100%" }}>
                    <Box
                        sx={{
                            p: 1.6,
                            borderRadius: 3,
                            bgcolor: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "rgba(255,255,255,0.56)",
                                textTransform: "uppercase",
                                letterSpacing: 0.8,
                            }}
                        >
                            Barbearia
                        </Typography>

                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{
                                mt: 0.5,
                                color: "#fff",
                                lineHeight: 1.2,
                                wordBreak: "break-word",
                            }}
                        >
                            {shopName}
                        </Typography>

                        <Chip
                            label={planName}
                            size="small"
                            sx={{
                                mt: 1.4,
                                height: 26,
                                fontWeight: 700,
                                bgcolor: "rgba(196,138,63,0.16)",
                                color: "#d89b49",
                                border: "1px solid rgba(216,155,73,0.28)",
                            }}
                        />
                    </Box>
                </Stack>
            </Toolbar>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

            <List sx={{ p: 2, flex: 1 }}>
                {sidebarRoutes.map((route) => (
                    <ListItemButton
                        key={route.path}
                        component={NavLink}
                        to={route.path}
                        sx={{
                            borderRadius: 3,
                            mb: 1,
                            px: 1.4,
                            py: 1.1,
                            color: "rgba(255,255,255,0.72)",
                            transition: "all 0.2s ease",
                            "& .MuiListItemIcon-root": {
                                color: "inherit",
                            },
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.05)",
                                color: "#fff",
                            },
                            "&.active": {
                                bgcolor: "rgba(196,138,63,0.14)",
                                color: "#fff",
                                border: "1px solid rgba(196,138,63,0.28)",
                                boxShadow: "inset 0 0 0 1px rgba(196,138,63,0.06)",
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 40,
                                color: "inherit",
                            }}
                        >
                            {route.icon}
                        </ListItemIcon>

                        <ListItemText
                            primary={route.label}
                            primaryTypographyProps={{
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}