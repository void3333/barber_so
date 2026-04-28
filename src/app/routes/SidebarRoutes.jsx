import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import EventNoteIcon from "@mui/icons-material/EventNote";
import Diversity3Icon from "@mui/icons-material/Diversity3";

export const sidebarRoutes = [
    {
        path: "/",
        label: "Painel Geral",
        icon: <DashboardRoundedIcon />,
        lazy: () => import("../pages/Dashboard/DashboardPage.jsx"),
    },
    {
        path: "/appointments",
        label: "Agendamentos",
        icon: <EventNoteIcon />,
        lazy: () => import("../pages/AppointmentsPage/AppointmentsPage.jsx"),
    },
    {
        path: "/clients",
        label: "Clientes",
        icon: <PeopleRoundedIcon />,
        lazy: () => import("../pages/ClientsPage/ClientsPage.jsx"),
    },
    {
        path: "/services",
        label: "Serviços",
        icon: <ContentCutRoundedIcon />,
        lazy: () => import("../pages/ServicesPage/ServicesPage.jsx"),
    },
    {
        path: "/staff",
        label: "Equipe",
        icon: <Diversity3Icon />,
        lazy: () => import("../pages/StaffPage/StaffPage.jsx"),
    },
    {
        path: "/settings",
        label: "Configurações",
        icon: <SettingsRoundedIcon />,
        lazy: () => import("../pages/SettingsPage/SettingsPage.jsx"),
    },
];
