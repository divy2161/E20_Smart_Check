import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import App from "../App.jsx";

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
  window.matchMedia = window.matchMedia || (() => ({ matches: false }));
});
afterEach(cleanup);

const pick = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });
const check = () => fireEvent.click(screen.getByRole("button", { name: /check my vehicle/i }));

describe("complete workflow: input -> rules -> verdict", () => {
  it("shows no verdict before the user presses Check", () => {
    render(<App />);
    expect(screen.queryByText(/max blend:/i)).toBeNull();
  });
  it("default vehicle (BS6 Phase 2 petrol car) shows E20 compatible", () => {
    render(<App />);
    check();
    expect(screen.getByText("Likely yes: E20 compatible")).toBeTruthy();
  });
  it("diesel vehicle shows not applicable", () => {
    render(<App />);
    pick("fuel", "diesel");
    check();
    expect(screen.getByText("Not applicable: diesel")).toBeTruthy();
  });
  it("pre-2010 vehicle is told to stay at E10 or lower", () => {
    render(<App />);
    pick("year", "old");
    check();
    expect(screen.getByText("Unlikely: stay at E10 or lower")).toBeTruthy();
  });
  it("E10-only label gives a No verdict", () => {
    render(<App />);
    pick("lab", "e10");
    check();
    expect(screen.getByText("No: stick to E10")).toBeTruthy();
  });
  it("E20 label on an old vehicle gives a Yes verdict", () => {
    render(<App />);
    pick("year", "old");
    pick("lab", "e20");
    check();
    expect(screen.getByText("Yes: E20 compatible")).toBeTruthy();
  });
  it("carburettor selection adds the lean-mixture warning", () => {
    render(<App />);
    pick("sys", "carb");
    check();
    expect(screen.getByText(/Carburettor engines can’t adjust/)).toBeTruthy();
  });
  it("renders the five-step blend ladder", () => {
    render(<App />);
    check();
    expect(document.querySelectorAll(".chip")).toHaveLength(5);
  });
  it("re-checking after a change replaces the previous verdict", () => {
    render(<App />);
    check();
    pick("fuel", "diesel");
    check();
    expect(screen.queryByText("Likely yes: E20 compatible")).toBeNull();
    expect(screen.getByText("Not applicable: diesel")).toBeTruthy();
  });
  it("offers a copy-result button once a verdict exists", () => {
    render(<App />);
    check();
    expect(screen.getByRole("button", { name: /copy result/i })).toBeTruthy();
  });
});

describe("calculator and interface", () => {
  it("shows the default extra-fuel estimate", () => {
    render(<App />);
    expect(screen.getByText("2.1 L")).toBeTruthy();
    expect(screen.getByText("₹196")).toBeTruthy();
  });
  it("shows 0.0 L when the mileage drop is set to 0%", () => {
    render(<App />);
    pick("dr", "0");
    expect(screen.getByText("0.0 L")).toBeTruthy();
  });
  it("updates when the distance changes", () => {
    render(<App />);
    pick("km", "2000");
    expect(screen.getByText("4.1 L")).toBeTruthy();
  });
  it("theme button switches the colour theme", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /theme/i }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
