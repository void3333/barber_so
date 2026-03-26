import {supabase} from "../../../lib/supabase.js";

export async function createStaffRecord({
                                            barbershopId,
                                            name,
                                            role,
                                            phone,
                                            isActive,
                                        }) {
    if (!barbershopId) {
        throw new Error("Barbershop ID is required.");
    }

    const { data, error } = await supabase
        .from("staff")
        .insert({
            barbershop_id: barbershopId,
            name,
            role,
            phone: phone || null,
            is_active: isActive,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}