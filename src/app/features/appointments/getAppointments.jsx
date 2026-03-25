import {supabase} from "../../lib/supabase.js";

export async function getAppointments(barbershopId) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const { data, error } = await supabase
        .from("appointments")
        .select(`
      id,
      created_at,
      starts_at,
      status,
      notes,
      client:clients (
        id,
        name
      ),
      service:services (
        id,
        name,
        duration_minutes,
        price
      )
    `)
        .eq("barbershop_id", barbershopId)
        .order("starts_at", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}