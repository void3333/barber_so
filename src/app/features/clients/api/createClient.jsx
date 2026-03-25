import {supabase} from "../../../lib/supabase.js";

export async function createClientRecord({ barbershopId, name, phone, notes }) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const { data, error } = await supabase
        .from("clients")
        .insert({
            barbershop_id: barbershopId,
            name,
            phone: phone || null,
            notes: notes || null,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}