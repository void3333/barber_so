import {supabase} from "../../../lib/supabase.js";

export async function deleteServiceRecord(id) {
    if (!id) {
        throw new Error("ID do serviço é obrigatório.");
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
        throw new Error("Nenhum serviço foi excluído. Verifique a política de exclusão.");
    }

    return data[0];
}
