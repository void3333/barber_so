import {supabase} from "../../../lib/supabase.js";

export async function getServices(barbershopId) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const { data, error } = await supabase
        .from("services")
        .select("id, created_at, name, duration_minutes, price")
        .eq("barbershop_id", barbershopId)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}