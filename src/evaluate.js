function evaluateCore(v) {
  var na = function (t, s, p) {
    return {
      c: "na",
      t: t,
      m: "No ethanol",
      l: ["na", "na", "na", "na", "na"],
      g: 0,
      gp: 0,
      sc: 30,
      s: s,
      p: p,
      lab: "–",
    };
  };
  if (v.fuel === "diesel")
    return na("Not applicable: diesel", "Diesel engines don’t use ethanol-blended petrol.", [
      "Never put petrol (including E20) in a diesel vehicle.",
    ]);
  if (v.fuel === "cng")
    return na(
      "Not applicable: CNG / LPG",
      "Gas vehicles run on gas; petrol blend matters only for bi-fuel vehicles.",
      ["For bi-fuel vehicles, check the petrol-side rating with your maker."],
    );
  if (v.fuel === "ev")
    return na("Not applicable: electric", "Electric vehicles don’t use petrol.", [
      "Hybrids with a petrol engine need checking separately.",
    ]);
  if (v.fuel === "flex")
    return {
      c: "good",
      t: "Flex-fuel: can take high blends",
      m: "Up to E85 (as labelled)",
      l: ["ok", "ok", "ok", "ok", "ok"],
      g: 85,
      gp: 85,
      sc: 100,
      lab: "E85",
      s: "Flex-fuel vehicles are built for high ethanol blends.",
      p: [
        "Use only the maximum blend printed on the label or manual.",
        "Mileage falls as the ethanol share rises.",
      ],
    };
  var pts = [];
  if (v.sys === "carb")
    pts.push(
      "Carburettor engines can’t adjust the mixture automatically, so extra ethanol makes them run lean. Hard starting and hot-running issues are more likely.",
    );
  if (v.lab === "e20")
    return {
      c: "good",
      t: "Yes: E20 compatible",
      m: "E20",
      l: ["ok", "ok", "ok", "caution", "no"],
      g: 20,
      gp: 20,
      sc: 30,
      lab: "E20",
      s: "Your label or manual says E20 is fine, the best evidence there is.",
      p: pts.concat([
        "Don’t go beyond E20 unless the manual says so.",
        "Expect a small mileage dip versus E10.",
      ]),
    };
  if (v.lab === "e10")
    return {
      c: "bad",
      t: "No: stick to E10",
      m: "E10",
      l: ["ok", "ok", "no", "no", "no"],
      g: 10,
      gp: 10,
      sc: 30,
      lab: "E10",
      s: "Your label says the maximum is 10% ethanol, so E20 isn’t recommended.",
      p: pts.concat([
        "Ask your maker whether a part kit or service makes it E20-safe.",
        "Look for E10 or ethanol-free fuel where available.",
      ]),
    };
  var r = {
    old: {
      c: "bad",
      t: "Unlikely: stay at E10 or lower",
      m: "E10 at most (E5 safer)",
      l: ["ok", "caution", "no", "no", "no"],
      g: 5,
      gp: 10,
      lab: "E5",
      s: "Vehicles from before 2010 were not designed for E20, and older rubber and metal parts are at higher risk.",
      p: [
        "Inspect fuel hoses, seals and the tank for cracks or leaks.",
        "Consider ethanol-resistant fuel lines.",
        "Avoid leaving the vehicle idle with ethanol fuel for weeks.",
      ],
    },
    bs4: {
      c: "warn",
      t: "Not designed for E20: be careful",
      m: "E10 confirmed; E20 uncertain",
      l: ["ok", "ok", "caution", "no", "no"],
      g: 10,
      gp: 20,
      lab: "E10",
      s: "Vehicles from this period were generally built for E10. Some tolerate E20, but it isn’t guaranteed.",
      p: [
        "Ask the maker about your exact model and year.",
        "Replace old hoses and gaskets first if you decide to use E20.",
        "Watch for rough idling, hard starts or a check-engine light.",
      ],
    },
    bs6a: {
      c: "warn",
      t: "Probably okay, but confirm",
      m: "E10 confirmed; E20 likely",
      l: ["ok", "ok", "caution", "no", "no"],
      g: 10,
      gp: 20,
      lab: "E10",
      s: "Many BS6 Phase 1 models tolerate E20, but they weren’t all required to be certified for it.",
      p: [
        "Check the label or ask the maker about your model.",
        "Fuel-injected engines adapt better than carburettor ones.",
      ],
    },
    bs6b: {
      c: "good",
      t: "Likely yes: E20 compatible",
      m: "E20 (confirm label)",
      l: ["ok", "ok", "ok", "caution", "no"],
      g: 20,
      gp: 20,
      lab: "E20",
      s: "Vehicles made from April 2023 are meant to carry E20-compatible materials, with a fuel label showing the rating.",
      p: [
        "Confirm the fuel-cap label before relying on this.",
        "Engines tuned for E20 came in many models from 2025; earlier ones may see a slightly bigger mileage dip.",
      ],
    },
    new: {
      c: "good",
      t: "Yes: should be E20 ready",
      m: "E20 (confirm label)",
      l: ["ok", "ok", "ok", "caution", "no"],
      g: 20,
      gp: 20,
      lab: "E20",
      s: "Vehicles made from April 2025 are expected to be both E20-compatible and E20-tuned.",
      p: ["Check the fuel-cap label or manual to be certain.", "Don’t exceed E20 unless the manual says so."],
    },
  }[v.year];
  r.sc = 30;
  r.p = pts.concat(r.p);
  return r;
}

export const BLENDS = ["E5", "E10", "E20", "E27", "E85"];

const ALLOWED = {
  type: ["2w", "3w", "car", "cv"],
  fuel: ["petrol", "flex", "diesel", "cng", "ev"],
  year: ["old", "bs4", "bs6a", "bs6b", "new"],
  sys: ["fi", "carb"],
  lab: ["none", "e20", "e10"],
};
const FIELD_NAMES = {
  type: "Vehicle type",
  fuel: "Fuel type",
  year: "Manufactured",
  sys: "Fuel system",
  lab: "Fuel-cap label",
};
const STATUS = { good: "PASS", warn: "WARNING", bad: "FAIL", na: "N/A" };

/**
 * Validates the input, then applies the rules.
 * Always returns a result object and never throws: bad input gives status "ERROR".
 */
export function evaluate(v) {
  const isObj = v !== null && typeof v === "object" && !Array.isArray(v);
  const invalid = Object.keys(ALLOWED).filter((k) => !isObj || !ALLOWED[k].includes(v[k]));
  if (invalid.length) {
    return {
      c: "na",
      status: "ERROR",
      t: "Error: incomplete or invalid input",
      m: "Cannot evaluate",
      l: ["na", "na", "na", "na", "na"],
      g: 0,
      gp: 0,
      sc: 30,
      lab: "–",
      s: "Some details are missing or not recognised, so no verdict can be given.",
      p: invalid.map((k) => `Select a valid option for “${FIELD_NAMES[k]}”.`),
    };
  }
  const r = evaluateCore(v);
  return { ...r, status: STATUS[r.c] };
}
