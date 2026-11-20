import { useEffect, useState } from "react";

const ARC = "M 20 105 A 80 80 0 0 1 180 105";

export default function Gauge({ r }) {
  const [on, setOn] = useState(false);

  // Reset, then fill on the next frames so the CSS transition plays.
  useEffect(() => {
    setOn(false);
    let b;
    const a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setOn(true));
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [r]);

  const offset = (v) => 100 - (on ? Math.min(100, (v / r.sc) * 100) : 0);

  return (
    <div className="gauge">
      <svg viewBox="0 0 200 125" role="img" aria-label="Maximum safe ethanol blend gauge">
        <path
          className="arc"
          pathLength="100"
          d={ARC}
          stroke="var(--line)"
          strokeDasharray="100"
          strokeDashoffset="0"
        />
        <path
          className="arc"
          pathLength="100"
          d={ARC}
          stroke="var(--warn)"
          strokeOpacity=".55"
          strokeDasharray="100"
          strokeDashoffset={offset(r.gp)}
        />
        <path
          className="arc"
          pathLength="100"
          d={ARC}
          stroke="var(--acc)"
          strokeDasharray="100"
          strokeDashoffset={offset(r.g)}
        />
        <text id="gv" x="100" y="88" textAnchor="middle" fontSize="34" fontWeight="800" fill="var(--text)">
          {r.lab}
        </text>
        <text x="100" y="108" textAnchor="middle" fontSize="10" fill="var(--muted)">
          max safe blend
        </text>
      </svg>
    </div>
  );
}
