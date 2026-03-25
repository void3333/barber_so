import {useNavigate} from "react-router-dom";
import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import {useAuth} from "../../hooks/useAuth.js";
import {supabase} from "../../lib/supabase.js";

export default function Topbar() {

    const navigate = useNavigate();

    const {profile, user, membership, barbershop} = useAuth();

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
        const {error} = await supabase.auth.signOut({scope: "local"});

        if (error) {
            console.error(error);
            return;
        }

        navigate("/login", {replace: true});
    }

    return (
        <AppBar
            position="static"
            color="inherit"
            elevation={0}
            sx={{borderBottom: 1, borderColor: "divider"}}
        >
            <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
                <Box>
                    <Typography variant="h6" fontWeight={600}>
                        Cargo: {membershipName || "Sem cargo"}
                    </Typography>
                </Box>
                <Box>
                    <Typography>{currentPlan.label}</Typography>
                    <Typography>{currentPlan.price}</Typography>
                </Box>

                <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                    <Typography variant="body2" color="text.secondary">
                        Olá, {displayName}
                    </Typography>

                    <Button onClick={handleLogout}>Sair</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}