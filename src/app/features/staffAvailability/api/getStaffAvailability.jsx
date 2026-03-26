import {supabase} from "../../../lib/supabase.js";

export async function getStaffAvailability(staffId) {
    if (!staffId) {
        throw new Error("Staff ID is required.");
    }

    const { data, error } = await supabase
        .from("staff_availability")
        .select("id, created_at, staff_id, weekday, start_time, end_time, is_active")
        .eq("staff_id", staffId)
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}