import {supabase} from "../../../lib/supabase.js";

export async function getClients(barbershopId) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const { data, error } = await supabase
        .from("clients")
        .select("id, created_at, name, phone, notes")
        .eq("barbershop_id", barbershopId)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}