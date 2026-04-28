import { useMemo } from "react";
import { useAuth } from "./useAuth.js";

const rolePermissions = {
    admin: ["appointments:write", "clients:write", "services:write", "staff:write", "settings:write"],
    manager: ["appointments:write", "clients:write", "services:write", "staff:write", "settings:write"],
    reception: ["appointments:write", "clients:write"],
    receptionist: ["appointments:write", "clients:write"],
    barber: ["appointments:write"],
};

export function usePermissions() {
    const { membership } = useAuth();

    return useMemo(() => {
        const role = membership?.role;
        const permissions = rolePermissions[role] || [];

        function can(permission) {
            return permissions.includes(permission);
        }

        return {
            role,
            can,
            canManageAppointments: can("appointments:write"),
            canManageClients: can("clients:write"),
            canManageServices: can("services:write"),
            canManageStaff: can("staff:write"),
            canManageSettings: can("settings:write"),
        };
    }, [membership?.role]);
}
