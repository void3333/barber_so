import {supabase} from "../../../lib/supabase.js";

export async function getStaff(barbershopId) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const {data, error} = await supabase
        .from("staff")
        .select("id, name, role, phone, is_active, created_at")
        .eq("barbershop_id", barbershopId)
        .eq("is_active", true)
        .order("name", {ascending: true});

    if (error) {
        throw error;
    }

    return data;
}