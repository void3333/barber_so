import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

import DashboardPage from "../pages/Dashboard/DashboardPage.jsx";
import ClientsPage from "../pages/ClientsPage/ClientsPage.jsx";
import ServicesPage from "../pages/ServicesPage/ServicesPage.jsx";
import SettingsPage from "../pages/SettingsPage/SettingsPage.jsx";

export const sidebarRoutes = [
    {
        path: "/",
        label: "Dashboard",
        icon: <DashboardRoundedIcon/>,
        element: <DashboardPage/>,
    },
    {
        path: "/clients",
        label: "Clients",
        icon: <PeopleRoundedIcon/>,
        element: <ClientsPage/>,
    },
    {
        path: "/services",
        label: "Services",
        icon: <ContentCutRoundedIcon/>,
        element: <ServicesPage/>,
    },
    {
        path: "/settings",
        label: "Settings",
        icon: <SettingsRoundedIcon/>,
        element: <SettingsPage/>,
    },
];