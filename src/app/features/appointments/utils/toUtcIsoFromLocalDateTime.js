export function toDatabaseDateTimeFromLocalDateTime(localDateTime) {
    if (!localDateTime) return null;

    const match = String(localDateTime).match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
    );

    if (!match) {
        return null;
    }

    const [, year, month, day, hour, minute, second = "00"] = match;
    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
    );

    if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day) ||
        date.getHours() !== Number(hour) ||
        date.getMinutes() !== Number(minute) ||
        date.getSeconds() !== Number(second)
    ) {
        return null;
    }

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

export function toUtcIsoFromLocalDateTime(localDateTime) {
    return toDatabaseDateTimeFromLocalDateTime(localDateTime);
}
