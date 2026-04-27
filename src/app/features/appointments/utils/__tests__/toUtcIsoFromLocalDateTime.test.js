import test from "node:test";
import assert from "node:assert/strict";
import {
    toDatabaseDateTimeFromLocalDateTime,
    toUtcIsoFromLocalDateTime,
} from "../toUtcIsoFromLocalDateTime.js";

test("retorna null para entrada vazia", () => {
    assert.equal(toDatabaseDateTimeFromLocalDateTime(""), null);
});

test("retorna null para data invalida", () => {
    assert.equal(toDatabaseDateTimeFromLocalDateTime("not-a-date"), null);
});

test("preserva datetime local para o banco", () => {
    const input = "2026-04-27T10:30";

    assert.equal(toDatabaseDateTimeFromLocalDateTime(input), "2026-04-27T10:30:00");
});

test("mantem compatibilidade do export antigo sem converter para UTC", () => {
    const input = "2026-04-08T15:34";

    assert.equal(toUtcIsoFromLocalDateTime(input), "2026-04-08T15:34:00");
});

test("retorna null para datas impossiveis", () => {
    assert.equal(toDatabaseDateTimeFromLocalDateTime("2026-02-31T10:30"), null);
});
