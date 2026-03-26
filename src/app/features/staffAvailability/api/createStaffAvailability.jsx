import {supabase} from "../../../lib/supabase.js";

export async function createStaffAvailabilityRecord({
                                                        staffId,
                                                        weekday,
                                                        startTime,
                                                        endTime,
                                                        isActive,
                                                    }) {
    if (!staffId) {
        throw new Error("Staff ID is required.");
    }

    const { data, error } = await supabase
        .from("staff_availability")
        .insert({
            staff_id: staffId,
            weekday: Number(weekday),
            start_time: startTime,
            end_time: endTime,
            is_active: isActive,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}