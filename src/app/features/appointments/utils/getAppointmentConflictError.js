function getDateTime(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function getDurationMinutes(service) {
    const duration = Number(service?.duration_minutes);
    return Number.isFinite(duration) && duration > 0 ? duration : 0;
}

function formatTime(value) {
    return value.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function getAppointmentConflictError({
    startsAt,
    serviceId,
    staffId,
    services,
    appointments,
    currentAppointmentId,
}) {
    if (!startsAt || !staffId) return "";

    const start = getDateTime(startsAt);
    const selectedService = services.find((service) => service.id === serviceId);
    const duration = getDurationMinutes(selectedService);

    if (!start || !duration) return "";

    const end = new Date(start.getTime() + duration * 60 * 1000);
    const conflict = appointments.find((appointment) => {
        if (appointment.id === currentAppointmentId) return false;
        if (appointment.status === "cancelled") return false;
        if (appointment.staff?.id !== staffId) return false;

        const existingStart = getDateTime(appointment.starts_at);
        const existingDuration = getDurationMinutes(appointment.service);

        if (!existingStart || !existingDuration) return false;

        const existingEnd = new Date(existingStart.getTime() + existingDuration * 60 * 1000);

        return start < existingEnd && end > existingStart;
    });

    if (!conflict) return "";

    const conflictStart = getDateTime(conflict.starts_at);
    const conflictDuration = getDurationMinutes(conflict.service);
    const conflictEnd = new Date(conflictStart.getTime() + conflictDuration * 60 * 1000);
    const clientName = conflict.client?.name || "outro cliente";
    const serviceName = conflict.service?.name || "outro serviço";

    return `Esse horário conflita com ${serviceName} de ${clientName}, das ${formatTime(conflictStart)} às ${formatTime(conflictEnd)}.`;
}
