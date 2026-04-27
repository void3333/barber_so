import {supabase} from "../../../lib/supabase.js";

export async function deleteStaffRecord(id) {
    if (!id) {
        throw new Error("Staff ID is required.");
    }

    const { data, error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id)
        .select("id");

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        throw new Error("Nenhum profissional foi excluído. Verifique a política de exclusão.");
    }

    return data[0];
}