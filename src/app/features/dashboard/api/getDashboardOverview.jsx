import {supabase} from "../../../lib/supabase.js";

function getTodayRange() {
    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

export async function getDashboardOverview(barbershopId) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const nowIso = new Date().toISOString();
    const { start, end } = getTodayRange();

    const [
        clientsResult,
        servicesResult,
        totalAppointmentsResult,
        todayAppointmentsResult,
        statusAppointmentsResult,
        upcomingAppointmentsResult,
    ] = await Promise.all([
        supabase
            .from("clients")
            .select("*", { count: "exact", head: true })
            .eq("barbershop_id", barbershopId),

        supabase
            .from("services")
            .select("*", { count: "exact", head: true })
            .eq("barbershop_id", barbershopId),

        supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("barbershop_id", barbershopId),

        supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("barbershop_id", barbershopId)
            .gte("starts_at", start)
            .lte("starts_at", end),

        supabase
            .from("appointments")
            .select("status")
            .eq("barbershop_id", barbershopId),

        supabase
            .from("appointments")
            .select(`
        id,
        starts_at,
        status,
        notes,
        client:clients (
          id,
          name
        ),
        service:services (
          id,
          name
        )
      `)
            .eq("barbershop_id", barbershopId)
            .gte("starts_at", nowIso)
            .order("starts_at", { ascending: true })
            .limit(5),
    ]);

    const results = [
        clientsResult,
        servicesResult,
        totalAppointmentsResult,
        todayAppointmentsResult,
        statusAppointmentsResult,
        upcomingAppointmentsResult,
    ];

    const firstError = results.find((result) => result.error)?.error;

    if (firstError) {
        throw firstError;
    }

    const upcomingAppointments = upcomingAppointmentsResult.data || [];
    const statusAppointments = statusAppointmentsResult.data || [];

    const statusSummary = statusAppointments.reduce(
        (accumulator, appointment) => {
            const status = appointment.status;

            if (!accumulator[status]) {
                accumulator[status] = 0;
            }

            accumulator[status] += 1;
            return accumulator;
        },
        {
            scheduled: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
        }
    );

    return {
        stats: {
            totalClients: clientsResult.count || 0,
            totalServices: servicesResult.count || 0,
            totalAppointments: totalAppointmentsResult.count || 0,
            todayAppointments: todayAppointmentsResult.count || 0,
        },
        upcomingAppointments,
        statusSummary,
    };
}
