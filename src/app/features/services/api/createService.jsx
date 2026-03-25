import {supabase} from "../../../lib/supabase.js";

export async function createServiceRecord({
                                              barbershopId,
                                              name,
                                              durationMinutes,
                                              price,
                                          }) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const { data, error } = await supabase
        .from("services")
        .insert({
            barbershop_id: barbershopId,
            name,
            duration_minutes: Number(durationMinutes),
            price: Number(price),
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}