import {supabase} from "../../lib/supabase.js";

export async function deleteAppointmentRecord(id) {
    if (!id) {
        throw new Error("Appointment ID is required.");
    }

    const { data, error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)
        .select("id");

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        throw new Error("Nenhum agendamento foi excluído. Verifique a política de exclusão.");
    }

    return data[0];
}