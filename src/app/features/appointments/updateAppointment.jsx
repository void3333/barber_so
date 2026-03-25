import {supabase} from "../../lib/supabase.js";

export async function updateAppointmentRecord({
                                                  id,
                                                  clientId,
                                                  serviceId,
                                                  startsAt,
                                                  status,
                                                  notes,
                                              }) {
    if (!id) {
        throw new Error("Appointment ID is required.");
    }

    const { data, error } = await supabase
        .from("appointments")
        .update({
            client_id: clientId,
            service_id: serviceId,
            starts_at: startsAt,
            status,
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