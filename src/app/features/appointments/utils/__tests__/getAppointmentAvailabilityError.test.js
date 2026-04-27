import test from "node:test";
import assert from "node:assert/strict";
import { getAppointmentAvailabilityError } from "../getAppointmentAvailabilityError.js";

const services = [{ id: "fade", duration_minutes: 30 }];
const weekdayAvailability = [
    {
        weekday: 3,
        start_time: "09:00:00",
        end_time: "18:00:00",
        is_active: true,
    },
];

test("aceita horario local dentro da disponibilidade do profissional", () => {
    const error = getAppointmentAvailabilityError({
        startsAt: "2026-04-08T15:34",
        serviceId: "fade",
        staffId: "jonas",
        services,
        availability: weekdayAvailability,
        availabilityFetched: true,
    });

    assert.equal(error, "");
});

test("bloqueia quando a duracao do servico ultrapassa o fim da faixa", () => {
    const error = getAppointmentAvailabilityError({
        startsAt: "2026-04-08T17:45",
        serviceId: "fade",
        staffId: "jonas",
        services,
        availability: weekdayAvailability,
        availabilityFetched: true,
    });

    assert.match(error, /09:00 as 18:00/);
});

test("bloqueia dias sem disponibilidade ativa", () => {
    const error = getAppointmentAvailabilityError({
        startsAt: "2026-04-12T15:34",
        serviceId: "fade",
        staffId: "jonas",
        services,
        availability: weekdayAvailability,
        availabilityFetched: true,
    });

    assert.match(error, /domingo/);
});
