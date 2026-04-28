import test from "node:test";
import assert from "node:assert/strict";
import { getAppointmentConflictError } from "../getAppointmentConflictError.js";

const services = [
    { id: "fade", duration_minutes: 30 },
    { id: "beard", duration_minutes: 45 },
];

const appointments = [
    {
        id: "appointment-1",
        starts_at: "2026-04-08T15:20:00",
        status: "scheduled",
        client: { name: "George Miranda" },
        service: { id: "beard", name: "Barba", duration_minutes: 45 },
        staff: { id: "jonas" },
    },
];

test("bloqueia agendamento que sobrepoe horario do mesmo barbeiro", () => {
    const error = getAppointmentConflictError({
        startsAt: "2026-04-08T15:34",
        serviceId: "fade",
        staffId: "jonas",
        services,
        appointments,
    });

    assert.match(error, /conflita/);
});

test("permite agendamento sem sobreposicao", () => {
    const error = getAppointmentConflictError({
        startsAt: "2026-04-08T16:10",
        serviceId: "fade",
        staffId: "jonas",
        services,
        appointments,
    });

    assert.equal(error, "");
});

test("ignora o proprio agendamento durante edicao", () => {
    const error = getAppointmentConflictError({
        startsAt: "2026-04-08T15:34",
        serviceId: "fade",
        staffId: "jonas",
        services,
        appointments,
        currentAppointmentId: "appointment-1",
    });

    assert.equal(error, "");
});
