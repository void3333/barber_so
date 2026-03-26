import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import EventNoteIcon from '@mui/icons-material/EventNote';
import Diversity3Icon from '@mui/icons-material/Diversity3';

import DashboardPage from "../pages/Dashboard/DashboardPage.jsx";
import ClientsPage from "../pages/ClientsPage/ClientsPage.jsx";
import ServicesPage from "../pages/ServicesPage/ServicesPage.jsx";
import SettingsPage from "../pages/SettingsPage/SettingsPage.jsx";
import AppointmentsPage from "../pages/AppointmentsPage/AppointmentsPage.jsx";
import StaffPage from "../pages/StaffPage/StaffPage.jsx";

export const sidebarRoutes = [
    {
        path: "/",
        label: "Painel Geral",
        icon: <DashboardRoundedIcon/>,
        element: <DashboardPage/>,
    },
    {
        path: "/appointments",
        label: "Agendamentos",
        icon: <EventNoteIcon/>,
        element: <AppointmentsPage/>,
    },
    {
        path: "/clients",
        label: "Clientes",
        icon: <PeopleRoundedIcon/>,
        element: <ClientsPage/>,
    },
    {
        path: "/services",
        label: "Serviços",
        icon: <ContentCutRoundedIcon/>,
        element: <ServicesPage/>,
    },
    {
        path: "/staff",
        label: "Equipe",
        icon: <Diversity3Icon/>,
        element: <StaffPage/>,
    },
    {
        path: "/settings",
        label: "Configurações",
        icon: <SettingsRoundedIcon/>,
        element: <SettingsPage/>,
    },
];