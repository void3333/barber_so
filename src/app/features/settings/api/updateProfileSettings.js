import { supabase } from "../../../lib/supabase.js";

export async function updateProfileSettings({ id, fullName }) {
    if (!id) {
        throw new Error("User ID is required.");
    }

    const { data, error } = await supabase
        .from("profiles")
        .update({
            full_name: fullName || null,
        })
        .eq("id", id)
        .select("full_name, email")
        .single();

    if (error) {
        throw error;
    }

    return data;
}
