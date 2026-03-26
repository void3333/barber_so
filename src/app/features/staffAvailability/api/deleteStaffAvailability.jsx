import {supabase} from "../../../lib/supabase.js";

export async function deleteStaffAvailabilityRecord(id) {
    if (!id) {
        throw new Error("Availability ID is required.");
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
        throw new Error("Nenhum horário foi excluído. Verifique a policy de delete.");
    }

    return data[0];
}