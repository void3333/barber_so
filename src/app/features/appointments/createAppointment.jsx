import {supabase} from "../../lib/supabase.js";

export async function createAppointmentRecord({
                                                  barbershopId,
                                                  clientId,
                                                  serviceId,
                                                  staffId,
                                                  startsAt,
                                                  status,
                                                  notes,
                                              }) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const insertPayload = {
        barbershop_id: barbershopId,
        client_id: clientId,
        service_id: serviceId,
        staff_id: staffId || null,
        starts_at: startsAt,
        status,
        notes: notes || null,
    };


    const { data, error } = await supabase
        .from("appointments")
        .insert(insertPayload)
        .select()
        .single();


    if (error) {
        throw error;
    }

    return data;
}