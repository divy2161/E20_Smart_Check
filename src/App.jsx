import { useState } from "react";
import Result from "./components/Result.jsx";
import Calculator from "./components/Calculator.jsx";
import { evaluate } from "./evaluate.js";

// [key, label, options, hint, fullWidth]
const FIELDS = [
  [
    "type",
    "Vehicle type",
    [
      ["2w", "Two-wheeler"],
      ["3w", "Three-wheeler"],
      ["car", "Car / SUV"],
      ["cv", "Commercial vehicle"],
    ],
  ],
  [
    "fuel",
    "Fuel type",
    [
      ["petrol", "Petrol"],
      ["flex", "Flex-fuel (labelled)"],
      ["diesel", "Diesel"],
      ["cng", "CNG / LPG"],
      ["ev", "Electric"],
    ],
  ],
  [
    "year",
    "Manufactured",
    [
      ["old", "Before 2010"],
      ["bs4", "2010 – Mar 2020 (BS4 or older)"],
      ["bs6a", "Apr 2020 – Mar 2023 (BS6 Phase 1)"],
      ["bs6b", "Apr 2023 – Mar 2025 (BS6 Phase 2)"],
      ["new", "Apr 2025 or later"],
    ],
  ],
  [
    "sys",
    "Fuel system",
    [
      ["fi", "Fuel injection (FI)"],
      ["carb", "Carburettor"],
    ],
    "Most cars after 2000 and most bikes after 2017 are FI.",
  ],
  [
    "lab",
    "Fuel-cap sticker or owner’s manual says…",
    [
      ["none", "I haven’t checked"],
      ["e20", "E20 compatible"],
      ["e10", "E10 only / max 10% ethanol"],
    ],
    "If you can find this, it overrides everything else.",
    true,
  ],
];

export default function App() {
  const [v, setV] = useState({ type: "car", fuel: "petrol", year: "bs6b", sys: "fi", lab: "none" });
  const [result, setResult] = useState(null);

  const toggleTheme = () => {
    const d = document.documentElement;
    const dark = matchMedia("(prefers-color-scheme: dark)").matches;
    const cur = d.getAttribute("data-theme") || (dark ? "dark" : "light");
    d.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  };

  return (
    <>
      <div className="blobs" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <main>
        <div className="top">
          <span />
          <button className="tgl" type="button" onClick={toggleTheme}>
            🌓 Theme
          </button>
        </div>

        <div className="hero">
          <div>
            <h1>
              Is your vehicle <span>E20&nbsp;ready?</span>
            </h1>
            <p className="sub">
              Check how much ethanol your petrol vehicle can safely take. Enter a few details and get an
              instant verdict.
            </p>
            <div className="pills">
              <span>⚡ Instant verdict</span>
              <span>📊 Live gauge</span>
              <span>💸 Cost estimate</span>
            </div>
          </div>
          <div className="art" aria-hidden="true">
            <svg viewBox="0 0 220 220">
              <defs>
                <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" style={{ stopColor: "var(--acc)" }} />
                  <stop offset="1" style={{ stopColor: "var(--acc2)" }} />
                </linearGradient>
              </defs>
              <circle
                cx="110"
                cy="116"
                r="92"
                fill="none"
                style={{ stroke: "var(--line)" }}
                strokeDasharray="3 7"
                strokeWidth="2"
              />
              <circle
                cx="110"
                cy="116"
                r="70"
                fill="none"
                style={{ stroke: "var(--acc)" }}
                strokeOpacity=".25"
                strokeWidth="2"
              />
              <path d="M110 22C110 22 50 98 50 140a60 60 0 0 0 120 0C170 98 110 22 110 22Z" fill="url(#dg)" />
              <path
                d="M78 138a32 32 0 0 0 22 30"
                fill="none"
                stroke="#fff"
                strokeOpacity=".55"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <text x="110" y="152" textAnchor="middle" fontSize="40" fontWeight="800" fill="#04210f">
                E20
              </text>
            </svg>
          </div>
        </div>

        <div className="steps">
          <div>
            <b>1</b>Enter your vehicle details
          </div>
          <div>
            <b>2</b>Get your E20 verdict
          </div>
          <div>
            <b>3</b>Fuel smart, save money
          </div>
        </div>

        <div className="card">
          <div className="grid">
            {FIELDS.map(([key, label, options, hint, full]) => (
              <div key={key} className={full ? "full" : undefined}>
                <label htmlFor={key}>{label}</label>
                <select id={key} value={v[key]} onChange={(e) => setV({ ...v, [key]: e.target.value })}>
                  {options.map(([val, text]) => (
                    <option key={val} value={val}>
                      {text}
                    </option>
                  ))}
                </select>
                {hint && <div className="hint">{hint}</div>}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setResult(evaluate(v))}>
            Check my vehicle
          </button>
        </div>

        {result && <Result r={result} />}

        <Calculator />

        <div className="card">
          <details open>
            <summary>How can I confirm for sure?</summary>
            <ul>
              <li>Check the fuel-filler cap or flap for an E10 or E20 label.</li>
              <li>Read the fuel recommendation in the owner’s manual.</li>
              <li>Call the maker’s helpline with your model and year.</li>
            </ul>
          </details>
          <details>
            <summary>What can go wrong in non-compatible vehicles?</summary>
            Ethanol can degrade older rubber hoses and seals, corrode some metal parts, and lean out
            carburettor engines, causing hard starts and rough running. It also absorbs moisture, which hurts
            during long storage.
          </details>
          <p className="foot">
            Rule-of-thumb guide based on manufacture date, fuel system and labels. It is not
            manufacturer-certified; always trust your manual or maker over this tool.
          </p>
        </div>

        <p className="made">Built as a college project · Drive clean, fuel smart 🌱</p>
      </main>
    </>
  );
}
