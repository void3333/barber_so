import React from 'react';
import {Outlet} from 'react-router-dom';
import {Box} from "@mui/material";
import Sidebar from "../common/Sidebar.jsx";
import Topbar from "../common/Topbar.jsx";

const AppLayout = () => {
    return (
        <Box style={{display: 'flex', minHeight: '100vh'}}>
            <Sidebar/>

            <Box sx={{flex: 1, display: "flex", flexDirection: 'column'}}>
                <Topbar/>

                <Box component="main" sx={{flex: 1, p: 3}}>
                    <Outlet/>
                </Box>

            </Box>

        </Box>
    );
};

export default AppLayout;