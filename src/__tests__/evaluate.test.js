import { describe, it, expect } from "vitest";
import { evaluate, BLENDS } from "../evaluate.js";

const T = ["2w", "3w", "car", "cv"],
  F = ["petrol", "flex", "diesel", "cng", "ev"];
const Y = ["old", "bs4", "bs6a", "bs6b", "new"],
  S = ["fi", "carb"],
  L = ["none", "e20", "e10"];
const combos = T.flatMap((type) =>
  F.flatMap((fuel) =>
    Y.flatMap((year) => S.flatMap((sys) => L.map((lab) => ({ type, fuel, year, sys, lab })))),
  ),
);
const base = { type: "car", fuel: "petrol", year: "bs6b", sys: "fi", lab: "none" };

// Independent expected-value table, written from the design rules (not copied from the code).
const byYear = {
  old: ["FAIL", 5],
  bs4: ["WARNING", 10],
  bs6a: ["WARNING", 10],
  bs6b: ["PASS", 20],
  new: ["PASS", 20],
};
const expected = (v) => {
  if (["diesel", "cng", "ev"].includes(v.fuel)) return ["N/A", 0];
  if (v.fuel === "flex") return ["PASS", 85];
  if (v.lab === "e20") return ["PASS", 20];
  if (v.lab === "e10") return ["FAIL", 10];
  return byYear[v.year];
};

describe("rule engine: functional", () => {
  it("returns a complete verdict for all 600 valid input combinations", () => {
    for (const v of combos) {
      const r = evaluate(v);
      expect(r.l).toHaveLength(5);
      expect(BLENDS).toHaveLength(5);
      expect(r.p.length).toBeGreaterThan(0);
      expect(r.g).toBeLessThanOrEqual(r.gp);
      expect(r.gp).toBeLessThanOrEqual(r.sc);
      expect(["PASS", "WARNING", "FAIL", "N/A"]).toContain(r.status);
    }
  });
  it("matches the expected-value table for all 600 combinations", () => {
    for (const v of combos) {
      const r = evaluate(v),
        [status, g] = expected(v);
      expect({ v, status: r.status, g: r.g }).toEqual({ v, status, g });
    }
  });
  it("gives the same output for the same input over 50 repeats (600 combinations)", () => {
    for (const v of combos) {
      const first = JSON.stringify(evaluate(v));
      for (let i = 0; i < 50; i++) expect(JSON.stringify(evaluate(v))).toBe(first);
    }
  });
  it("never returns ERROR for valid input", () => {
    expect(combos.some((v) => evaluate(v).status === "ERROR")).toBe(false);
  });
  it("returns N/A for diesel, CNG and electric in every case", () => {
    for (const v of combos.filter((x) => ["diesel", "cng", "ev"].includes(x.fuel)))
      expect(evaluate(v).status).toBe("N/A");
  });
});

describe("rule engine: rule behaviour", () => {
  it("max safe blend never decreases for newer manufacture eras", () => {
    const g = Y.map((year) => evaluate({ ...base, year }).g);
    expect(g).toEqual([...g].sort((a, b) => a - b));
  });
  it("an E20 label overrides manufacture era", () => {
    for (const year of Y)
      for (const sys of S) {
        const r = evaluate({ ...base, year, sys, lab: "e20" });
        expect([r.status, r.g]).toEqual(["PASS", 20]);
      }
  });
  it("an E10 label caps the blend at E10 for every era", () => {
    for (const year of Y)
      for (const sys of S) {
        const r = evaluate({ ...base, year, sys, lab: "e10" });
        expect([r.status, r.g]).toEqual(["FAIL", 10]);
      }
  });
  it("carburettor vehicles always get the lean-mixture warning first", () => {
    for (const year of Y)
      for (const lab of L)
        expect(evaluate({ ...base, type: "2w", year, sys: "carb", lab }).p[0]).toMatch(/carburettor/i);
  });
  it("flex-fuel vehicles can take up to E85", () => {
    expect(evaluate({ ...base, fuel: "flex" }).g).toBe(85);
  });
});

describe("rule engine: invalid input handling", () => {
  const INVALID = [
    ["unknown year", { ...base, year: "xyz" }],
    ["missing year", { type: "car", fuel: "petrol", sys: "fi", lab: "none" }],
    ["empty object", {}],
    ["null", null],
    ["undefined", undefined],
    ["unknown fuel (hydrogen)", { ...base, fuel: "hydrogen" }],
    ["unknown vehicle type", { ...base, type: "bus" }],
    ["unknown fuel system", { ...base, sys: "turbo" }],
    ["unknown label", { ...base, lab: "e85" }],
    ["numeric instead of text", { ...base, year: 2023 }],
    ["string instead of object", "petrol"],
    ["array instead of object", []],
  ];
  it.each(INVALID)("returns ERROR without throwing: %s", (_name, v) => {
    let r;
    expect(() => {
      r = evaluate(v);
    }).not.toThrow();
    expect(r.status).toBe("ERROR");
    expect(r.p.length).toBeGreaterThan(0);
  });
});
