import {supabase} from "../../../lib/supabase.js";

export async function deleteClientRecord(id) {
    if (!id) {
        throw new Error("Client ID is required.");
    }

    const { data, error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id)
        .select("id");

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        throw new Error("Nenhum cliente foi excluído. Verifique a policy de delete.");
    }

    return data[0];
}