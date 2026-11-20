import { useState } from "react";
import { extraFuel } from "../calc.js";

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function Calculator() {
  const [f, setF] = useState({ km: 1000, mil: 15, pr: 95, dr: 3 });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const res = extraFuel({ km: f.km, mil: f.mil, price: f.pr, dropPct: f.dr }) ?? {
    litres: 0,
    month: 0,
    year: 0,
  };

  return (
    <div className="card">
      <h3 className="sec">💸 What will E20 cost my mileage?</h3>
      <div className="grid">
        <div>
          <label htmlFor="km">Distance / month (km)</label>
          <input type="number" id="km" min="0" value={f.km} onChange={set("km")} />
        </div>
        <div>
          <label htmlFor="mil">Current mileage (km/l)</label>
          <input type="number" id="mil" min="1" step="0.5" value={f.mil} onChange={set("mil")} />
        </div>
        <div>
          <label htmlFor="pr">Petrol price (₹/l)</label>
          <input type="number" id="pr" min="1" value={f.pr} onChange={set("pr")} />
        </div>
        <div>
          <label htmlFor="dr">
            Mileage drop: <b>{f.dr}</b>%
          </label>
          <input type="range" id="dr" min="0" max="8" step="0.5" value={f.dr} onChange={set("dr")} />
        </div>
      </div>
      <div className="out">
        <div>
          <b>{res.litres.toFixed(1)} L</b>
          <small>extra litres / month</small>
        </div>
        <div>
          <b>{inr(res.month)}</b>
          <small>extra ₹ / month</small>
        </div>
        <div>
          <b>{inr(res.year)}</b>
          <small>extra ₹ / year</small>
        </div>
      </div>
      <div className="hint">
        The mileage drop is an adjustable estimate; real drops vary by vehicle and tuning. Assumes the same
        price per litre.
      </div>
    </div>
  );
}
