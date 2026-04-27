import test from "node:test";
import assert from "node:assert/strict";
import { getAppointmentErrorMessage } from "../getAppointmentErrorMessage.js";

test("retorna mensagem amigável para erro conhecido", () => {
    const result = getAppointmentErrorMessage({
        message: "appointment is outside staff availability",
    });

    assert.equal(result, "Esse horário está fora da disponibilidade do profissional.");
});

test("faz mapeamento mesmo com variação de caixa", () => {
    const result = getAppointmentErrorMessage({
        message: "STAFF ALREADY HAS AN OVERLAPPING APPOINTMENT",
    });

    assert.equal(result, "Esse profissional já possui um agendamento nesse horário.");
});

test("retorna fallback amigável quando não há mensagem", () => {
    assert.equal(getAppointmentErrorMessage({}), "Não foi possível salvar o agendamento.");
});
