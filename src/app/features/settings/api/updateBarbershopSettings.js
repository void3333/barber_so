import { supabase } from "../../../lib/supabase.js";

export async function updateBarbershopSettings({ id, name, phone }) {
    if (!id) {
        throw new Error("Barbershop ID is required.");
    }

    const { data, error } = await supabase
        .from("barbershops")
        .update({
            name,
            phone: phone || null,
        })
        .eq("id", id)
        .select("id, name, slug, phone, plan, created_by")
        .single();

    if (error) {
        throw error;
    }

    return data;
}
