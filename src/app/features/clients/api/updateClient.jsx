import {supabase} from "../../../lib/supabase.js";

export async function updateClientRecord({ id, name, phone, notes }) {
    if (!id) {
        throw new Error("Client ID is required.");
    }

    const { data, error } = await supabase
        .from("clients")
        .update({
            name,
            phone: phone || null,
            notes: notes || null,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}