export function toUtcIsoFromLocalDateTime(localDateTime) {
    if (!localDateTime) return null;

    const localDate = new Date(localDateTime);

    if (Number.isNaN(localDate.getTime())) {
        return null;
    }

    return localDate.toISOString();
}