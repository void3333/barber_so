import {supabase} from "../../../lib/supabase.js";

export async function deleteServiceRecord(id) {
    if (!id) {
        throw new Error("Service ID is required.");
    }

    const { data, error } = await supabase
        .from("services")
        .delete()
        .eq("id", id)
        .select("id");

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        throw new Error("Nenhum serviço foi excluído. Verifique a policy de delete.");
    }

    return data[0];
}