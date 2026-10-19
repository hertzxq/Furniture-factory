import { describe, it, expect } from "vitest";
import { readProjects, writeProjects } from "./storage";
import { bookingDates, reserveSlot, isOccupied } from "./booking";
import { createProject } from "../domain/project";
function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}
describe("local projects", () => {
  it("recovers saved projects", () => {
    const s = memoryStorage(),
      p = createProject();
    writeProjects([p], s);
    expect(readProjects(s)).toEqual([p]);
  });
  it("reports unavailable storage without mutating project", () => {
    const s = {
      getItem: () => {
        throw Error("blocked");
      },
      setItem: () => {
        throw Error("full");
      },
    };
    expect(readProjects(s)).toEqual([]);
    const p = createProject();
    expect(() => writeProjects([p], s)).toThrow();
    expect(p.name).toBe("Моя кухня");
  });
  it("skips corrupt saved projects", () => {
    const s = memoryStorage();
    s.setItem("forma-projects", JSON.stringify([{}, createProject()]));
    expect(readProjects(s)).toHaveLength(1);
  });
});
describe("demo appointments", () => {
  it("offers fourteen distinct local calendar days including month rollover", () => {
    const dates = bookingDates(new Date(2026, 0, 28));
    expect(dates).toHaveLength(14);
    expect(dates[0]).toBe("2026-01-28");
    expect(dates[13]).toBe("2026-02-10");
  });
  it("reserves a free slot, rejects duplicate and persists no personal data", () => {
    const s = memoryStorage();
    const date = bookingDates()[1];
    const time = ["10:00", "12:00", "14:00", "16:00", "18:00"].find(
      (t) => !isOccupied(date, t, s),
    )!;
    reserveSlot(date, time, s);
    expect(isOccupied(date, time, s)).toBe(true);
    expect(() => reserveSlot(date, time, s)).toThrow();
    expect(s.getItem("forma-bookings")).toBe(
      JSON.stringify([`${date}|${time}`]),
    );
  });
  it("rejects past dates and unknown times", () => {
    const s = memoryStorage();
    expect(() => reserveSlot("2000-01-01", "10:00", s)).toThrow();
    expect(() => reserveSlot(bookingDates()[0], "03:00", s)).toThrow();
  });
});
