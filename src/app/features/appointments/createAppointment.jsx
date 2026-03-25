import {supabase} from "../../lib/supabase.js";

export async function createAppointmentRecord({
                                                  barbershopId,
                                                  clientId,
                                                  serviceId,
                                                  startsAt,
                                                  status,
                                                  notes,
                                              }) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const { data, error } = await supabase
        .from("appointments")
        .insert({
            barbershop_id: barbershopId,
            client_id: clientId,
            service_id: serviceId,
            starts_at: startsAt,
            status,
            notes: notes || null,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}