import { useEffect, useRef, useState } from "react";
import Gauge from "./Gauge.jsx";
import { BLENDS } from "../evaluate.js";

const STATUS = {
  ok: ["good", "Safe"],
  caution: ["warn", "Uncertain"],
  no: ["bad", "Avoid"],
  na: ["na", "N/A"],
};
const COPY = "📋 Copy result";

export default function Result({ r }) {
  const ref = useRef(null);
  const [copyLabel, setCopyLabel] = useState(COPY);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [r]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`E20 check: ${r.t}. Max blend: ${r.m}.`);
      setCopyLabel("Copied ✓");
    } catch {
      setCopyLabel("Copy not allowed here");
    }
    setTimeout(() => setCopyLabel(COPY), 2000);
  };

  return (
    <div className="card" ref={ref} aria-live="polite">
      <div className={`verdict ${r.c}`}>
        <h2>{r.t}</h2>
        <p>{r.s}</p>
        <p style={{ marginTop: 6 }}>
          <strong>Max blend: </strong>
          <span>{r.m}</span>
        </p>
      </div>

      <Gauge r={r} />

      <strong>Blend ladder</strong>
      <div className="ladder">
        {BLENDS.map((b, i) => {
          const [cls, text] = STATUS[r.l[i]];
          return (
            <div key={b} className={`chip ${cls}`}>
              {b}
              <small>{text}</small>
            </div>
          );
        })}
      </div>
      <div className="hint">
        E20 = 20% ethanol + 80% petrol. E85 applies only to labelled flex-fuel vehicles. Faint arc = possible
        but unconfirmed.
      </div>

      <h3>What this means for you</h3>
      <ul>
        {r.p.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <button type="button" onClick={copy}>
        {copyLabel}
      </button>
    </div>
  );
}
