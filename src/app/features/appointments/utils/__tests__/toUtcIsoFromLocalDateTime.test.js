import test from "node:test";
import assert from "node:assert/strict";
import { toUtcIsoFromLocalDateTime } from "../toUtcIsoFromLocalDateTime.js";

test("retorna null para entrada vazia", () => {
    assert.equal(toUtcIsoFromLocalDateTime(""), null);
});

test("retorna null para data inválida", () => {
    assert.equal(toUtcIsoFromLocalDateTime("not-a-date"), null);
});

test("converte datetime local para ISO UTC", () => {
    const input = "2026-04-27T10:30";

    assert.equal(toUtcIsoFromLocalDateTime(input), new Date(input).toISOString());
});
