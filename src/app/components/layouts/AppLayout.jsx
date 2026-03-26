import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "../common/Sidebar.jsx";
import Topbar from "../common/Topbar.jsx";

const AppLayout = () => {
    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                bgcolor: "#111214",
            }}
        >
            <Sidebar />

            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "#f7f4ee",
                    overflow: "hidden",
                }}
            >
                <Topbar />

                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        overflowY: "auto",
                        p: { xs: 2, md: 3 },
                        bgcolor: "#f7f4ee",
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default AppLayout;