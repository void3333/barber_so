import {supabase} from "../../../lib/supabase.js";

export async function updateStaffRecord({
                                            id,
                                            name,
                                            role,
                                            phone,
                                            isActive,
                                        }) {
    if (!id) {
        throw new Error("Staff ID is required.");
    }

    const { data, error } = await supabase
        .from("staff")
        .update({
            name,
            role,
            phone: phone || null,
            is_active: isActive,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}