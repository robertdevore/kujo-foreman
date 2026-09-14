import { parseForemanEvent } from "./api";

describe("parseForemanEvent", () => {
  it("accepts a typed event envelope", () => {
    expect(parseForemanEvent('{"type":"run.status","sequence":3,"status":"running","timestamp":"2026-09-13T12:00:00Z"}')).toMatchObject({ type: "run.status", sequence: 3 });
  });

  it.each(["not-json", "{}", '{"type":"run.status"}', '{"sequence":1}'])("rejects malformed event %s", (raw) => {
    expect(parseForemanEvent(raw)).toBeNull();
  });
});
