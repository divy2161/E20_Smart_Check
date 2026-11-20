import { describe, it, expect } from "vitest";
import { extraFuel } from "../calc.js";

const ok = { km: 1000, mil: 15, price: 95, dropPct: 3 };

describe("mileage calculator", () => {
  it("matches a hand calculation for the default inputs", () => {
    const r = extraFuel(ok);
    expect(r.litres).toBeCloseTo(1000 / (15 * 0.97) - 1000 / 15, 6);
    expect(r.month).toBeCloseTo(r.litres * 95, 6);
    expect(r.year).toBeCloseTo(r.month * 12, 6);
  });
  it.each([
    ["zero mileage drop gives zero extra fuel", { ...ok, dropPct: 0 }],
    ["zero distance gives zero extra fuel", { ...ok, km: 0 }],
  ])("%s", (_n, v) => expect(extraFuel(v).litres).toBeCloseTo(0, 9));
  it.each([
    ["distance just above zero (1 km)", { ...ok, km: 1 }],
    ["smallest slider mileage step (0.5 km/l)", { ...ok, mil: 0.5 }],
    ["largest slider drop (8%)", { ...ok, dropPct: 8 }],
    ["drop just below limit (99.9%)", { ...ok, dropPct: 99.9 }],
  ])("accepts boundary value: %s", (_n, v) => expect(extraFuel(v)).not.toBeNull());
  it.each([
    ["negative distance", { ...ok, km: -1 }],
    ["zero mileage", { ...ok, mil: 0 }],
    ["negative mileage", { ...ok, mil: -5 }],
    ["zero price", { ...ok, price: 0 }],
    ["negative drop", { ...ok, dropPct: -0.5 }],
    ["drop of exactly 100%", { ...ok, dropPct: 100 }],
    ["non-numeric distance", { ...ok, km: "abc" }],
  ])("rejects invalid value: %s", (_n, v) => expect(extraFuel(v)).toBeNull());
  it("extra fuel grows as the mileage drop grows", () => {
    const l = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((d) => extraFuel({ ...ok, dropPct: d }).litres);
    expect(l).toEqual([...l].sort((a, b) => a - b));
  });
  it("doubling the distance doubles the extra fuel", () => {
    expect(extraFuel({ ...ok, km: 2000 }).litres).toBeCloseTo(2 * extraFuel(ok).litres, 9);
  });
});
