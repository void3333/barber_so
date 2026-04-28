import { lazy, Suspense } from "react";
import {createBrowserRouter} from "react-router-dom";
import {sidebarRoutes} from "./SidebarRoutes.jsx";
import AppLayout from "../components/layouts/AppLayout.jsx";
import GuestRoute from "./GuestRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "../pages/LoginPage/LoginPage.jsx";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage.jsx";

function lazyRouteElement(loadPage) {
    const Page = lazy(loadPage);

    return (
        <Suspense fallback={<div style={{ padding: 24, fontWeight: 800 }}>Carregando...</div>}>
            <Page />
        </Suspense>
    );
}

const appChildren = sidebarRoutes.map((route) => {
    const element = route.lazy ? lazyRouteElement(route.lazy) : route.element;

    if (route.path === "/") {
        return {
            index: true,
            element,
        };
    }

    return {
        path: route.path.slice(1),
        element,
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
