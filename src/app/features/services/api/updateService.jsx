import {supabase} from "../../../lib/supabase.js";

export async function updateServiceRecord({
                                              id,
                                              name,
                                              durationMinutes,
                                              price,
                                          }) {
    if (!id) {
        throw new Error("Service ID is required.");
    }

    const { data, error } = await supabase
        .from("services")
        .update({
            name,
            duration_minutes: Number(durationMinutes),
            price: Number(price),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}