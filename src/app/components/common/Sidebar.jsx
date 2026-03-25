// noinspection SpellCheckingInspection,JSValidateTypes

import {NavLink} from "react-router-dom";
import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import {sidebarRoutes} from "../../routes/SidebarRoutes.jsx";
import {useAuth} from "../../hooks/useAuth.js";

export default function Sidebar() {

    const { barbershop } = useAuth();

    const shopName = barbershop?.name || "Sem barbearia";

    return (
        <Box
            sx={{
                width: 260,
                borderRight: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Toolbar>
                <Typography variant="h6" fontWeight={700}>
                    {shopName}
                </Typography>
            </Toolbar>

            <Divider/>

            <List sx={{p: 2}}>
                {sidebarRoutes.map((route) => (
                    <ListItemButton
                        key={route.path}
                        component={NavLink}
                        to={route.path}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            color: "text.primary",
                            "&.active": {
                                bgcolor: "action.selected",
                            },
                        }}
                    >
                        <ListItemIcon sx={{minWidth: 40, color: "inherit"}}>
                            {route.icon}
                        </ListItemIcon>
                        <ListItemText primary={route.label}/>
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}