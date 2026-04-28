import {supabase} from "../../../lib/supabase.js";

export async function deleteStaffAvailabilityRecord(id) {
    if (!id) {
        throw new Error("ID do horário é obrigatório.");
    }

    const { data, error } = await supabase
        .from("staff_availability")
        .delete()
        .eq("id", id)
        .select("id");

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        throw new Error("Nenhum horário foi excluído. Verifique a política de exclusão.");
    }

    return data[0];
}
