const weekdayNames = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const weekdayLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function timeToMinutes(value) {
    const [hours, minutes] = String(value || "").split(":").map(Number);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return null;
    }

    return hours * 60 + minutes;
}

function formatMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function getLocalDateTimeParts(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const date = new Date(year, month - 1, day, hour, minute);

    if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute
    ) {
        return null;
    }

    return {
        weekday: date.getDay(),
        minutes: hour * 60 + minute,
    };
}

export function getAppointmentAvailabilityError({
    startsAt,
    serviceId,
    staffId,
    services,
    availability,
    availabilityFetched,
}) {
    if (!staffId || !startsAt || !availabilityFetched) return "";

    const dateTime = getLocalDateTimeParts(startsAt);

    if (!dateTime) {
        return "Informe uma data e hora válida para conferir a disponibilidade.";
    }

    const selectedService = services.find((service) => service.id === serviceId);
    const duration = Number(selectedService?.duration_minutes) || 0;
    const appointmentEnd = dateTime.minutes + duration;
    const dayRanges = availability
        .filter((range) => range.is_active && Number(range.weekday) === dateTime.weekday)
        .map((range) => ({
            start: timeToMinutes(range.start_time),
            end: timeToMinutes(range.end_time),
        }))
        .filter((range) => range.start !== null && range.end !== null);

    if (dayRanges.length === 0) {
        return `Essa data não pode ser usada: o barbeiro não possui disponibilidade ativa para ${weekdayNames[dateTime.weekday]}.`;
    }

    const isInsideRange = dayRanges.some((range) => (
        dateTime.minutes >= range.start &&
        (duration > 0 ? appointmentEnd <= range.end : dateTime.minutes <= range.end)
    ));

    if (isInsideRange) return "";

    const rangesText = dayRanges.map((range) => `${formatMinutes(range.start)} às ${formatMinutes(range.end)}`).join(", ");
    const durationText = duration > 0 ? ` considerando ${duration} min de serviço` : "";

    return `Essa data e hora não podem ser usadas: o horário fica fora da disponibilidade do barbeiro em ${weekdayLabels[dateTime.weekday]} (${rangesText})${durationText}.`;
}
