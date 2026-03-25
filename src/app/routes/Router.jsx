import {createBrowserRouter} from "react-router-dom";
import {sidebarRoutes} from "./SidebarRoutes.jsx";
import AppLayout from "../components/layouts/AppLayout.jsx";
import GuestRoute from "./GuestRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "../pages/LoginPage/LoginPage.jsx";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage.jsx";

const appChildren = sidebarRoutes.map((route) => {
    if (route.path === "/") {
        return {
            index: true,
            element: route.element,
        };
    }

    return {
        path: route.path.slice(1),
        element: route.element,
    };
});

const router = createBrowserRouter([
    {
        element: <GuestRoute/>,
        children: [
            {
                path: "/login",
                element: <LoginPage/>,
            },
        ],
    },
    {
        path: "/checkout",
        element: <CheckoutPage />,
    },
    {
        element: <ProtectedRoute/>,
        children: [
            {
                path: "/",
                element: <AppLayout/>,
                children: appChildren,
            },
        ],
    },
]);

export default router;