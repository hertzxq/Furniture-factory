import { browserStore, type Store } from "./storage";
export const TIMES = ["10:00", "12:00", "14:00", "16:00", "18:00"];
export function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function bookingDates(now = new Date()): string[] {
  return Array.from({ length: 14 }, (_, i) =>
    localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)),
  );
}
function booked(store: Store): string[] {
  try {
    const v: unknown = JSON.parse(store.getItem("forma-bookings") ?? "[]");
    return Array.isArray(v)
      ? v.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}
export function isOccupied(
  date: string,
  time: string,
  store: Store = browserStore(),
): boolean {
  const [y, m, d] = date.split("-").map(Number);
  const slot = new Date(y, m - 1, d, ...time.split(":").map(Number));
  if (slot.getTime() <= Date.now()) return true;
  const hash = [...(date + time)].reduce((s, c) => s + c.charCodeAt(0), 0);
  return hash % 5 === 0 || booked(store).includes(`${date}|${time}`);
}
export function reserveSlot(
  date: string,
  time: string,
  store: Store = browserStore(),
): void {
  if (
    !bookingDates().includes(date) ||
    !TIMES.includes(time) ||
    isOccupied(date, time, store)
  )
    throw Error("Этот слот недоступен. Выберите другое время.");
  try {
    store.setItem(
      "forma-bookings",
      JSON.stringify([...booked(store), `${date}|${time}`]),
    );
  } catch {
    throw Error("Не удалось сохранить выбранное время. Попробуйте ещё раз.");
  }
}
