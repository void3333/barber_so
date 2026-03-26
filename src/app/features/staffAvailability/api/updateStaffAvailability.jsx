import {supabase} from "../../../lib/supabase.js";

export async function updateStaffAvailabilityRecord({
                                                        id,
                                                        weekday,
                                                        startTime,
                                                        endTime,
                                                        isActive,
                                                    }) {
    if (!id) {
        throw new Error("Availability ID is required.");
    }

    const { data, error } = await supabase
        .from("staff_availability")
        .update({
            weekday: Number(weekday),
            start_time: startTime,
            end_time: endTime,
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