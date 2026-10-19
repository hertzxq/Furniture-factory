import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  Clock3,
  MapPin,
  Ruler,
} from "lucide-react";
import { Button } from "../ui/button";
import { PhoneInput } from "../ui/phone-input";
import {
  bookingDates,
  isOccupied,
  reserveSlot,
  TIMES,
} from "../../services/booking";
import { demoCRM } from "../../services/crm";
import { estimate } from "../../domain/pricing";
import { layoutName, money } from "../../data/materials";
import type { Project } from "../../domain/types";
export function Booking({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [formHeight, setFormHeight] = useState<number>();
  const [dates] = useState(() => bookingDates());
  const [date, setDate] = useState(dates[0]),
    [time, setTime] = useState(""),
    [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [city, setCity] = useState("Москва"),
    [room, setRoom] = useState("Квартира"),
    [error, setError] = useState(""),
    [done, setDone] = useState<{ date: string; time: string } | null>(null),
    [loading, setLoading] = useState(false);
  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Укажите имя — не менее двух символов.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Введите 10 цифр номера после +7.");
      return;
    }
    if (!city.trim()) {
      setError("Укажите город или район.");
      return;
    }
    if (!time) {
      setError("Выберите свободное время.");
      return;
    }
    setFormHeight(ev.currentTarget.getBoundingClientRect().height);
    setLoading(true);
    try {
      await demoCRM.submit({
        date,
        time,
        name,
        phone: `+7${phone}`,
        city,
        room,
        projectSummary: `${layoutName(project.layout)} · ${money(estimate(project).total)}`,
      });
      reserveSlot(date, time);
      setDone({ date, time });
      setName("");
      setPhone("");
    } catch (err) {
      setError((err as Error).message);
      setTime("");
    } finally {
      setLoading(false);
    }
  }
  const reveal = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "tween" as const,
        duration: reducedMotion ? 0 : 0.35,
      },
    },
  };
  return (
    <div className="booking-stage" style={{ minHeight: formHeight }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="success"
            className={`booking-success ${compact ? "compact" : ""}`}
            role="status"
            tabIndex={-1}
            ref={(element) => {
              element?.focus({ preventScroll: true });
            }}
            initial="hidden"
            animate="visible"
            exit={{
              opacity: 0,
              transition: { duration: reducedMotion ? 0 : 0.16 },
            }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  duration: reducedMotion ? 0 : 0.3,
                  staggerChildren: reducedMotion ? 0 : 0.1,
                },
              },
            }}
          >
            <motion.span className="success-icon" variants={reveal}>
              <motion.svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <motion.path
                  d="M5 12l4 4L19 6"
                  initial={{ pathLength: reducedMotion ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.45,
                    delay: reducedMotion ? 0 : 0.15,
                  }}
                />
              </motion.svg>
            </motion.span>
            <motion.h3 variants={reveal}>
              Время <em>выбрано.</em>
            </motion.h3>
            <motion.p variants={reveal}>
              {new Date(done.date + "T12:00:00").toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
              })}
              , {done.time} · {city}
            </motion.p>
            <motion.div variants={reveal}>
              <Button
                variant="outline"
                onClick={() => {
                  setDone(null);
                  setTime("");
                }}
              >
                Вернуться к календарю
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className={`booking-form ${compact ? "compact" : ""}`}
            onSubmit={submit}
            aria-busy={loading}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
          >
            <div className="booking-project">
              <Ruler size={19} />
              <div>
                <b>Ваш проект</b>
                <p>
                  {project.name} · {layoutName(project.layout)} ·{" "}
                  {money(estimate(project).total)}
                </p>
              </div>
            </div>
            <div className="flex-between">
              <label className="field-label">
                <CalendarDays size={15} /> Удобная дата
              </label>
              <span className="small-muted">Ближайшие 14 дней</span>
            </div>
            <div className="date-list">
              {dates.map((d) => {
                const dt = new Date(d + "T12:00:00");
                return (
                  <motion.button
                    type="button"
                    key={d}
                    className={date === d ? "selected" : ""}
                    aria-pressed={date === d}
                    whileHover={reducedMotion ? undefined : { y: -2 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.25 }}
                    onClick={() => {
                      setDate(d);
                      setTime("");
                    }}
                  >
                    <small>
                      {dt.toLocaleDateString("ru-RU", { weekday: "short" })}
                    </small>
                    <b>{dt.getDate()}</b>
                    <small>
                      {dt
                        .toLocaleDateString("ru-RU", { month: "short" })
                        .replace(".", "")}
                    </small>
                  </motion.button>
                );
              })}
            </div>
            <label className="field-label">
              <Clock3 size={15} /> Время приезда
            </label>
            <div className="time-list">
              {TIMES.map((t) => (
                <motion.button
                  type="button"
                  key={t}
                  disabled={isOccupied(date, t)}
                  className={time === t ? "selected" : ""}
                  aria-pressed={time === t}
                  whileHover={
                    reducedMotion || isOccupied(date, t) ? undefined : { y: -2 }
                  }
                  whileTap={
                    reducedMotion || isOccupied(date, t)
                      ? undefined
                      : { scale: 0.96 }
                  }
                  transition={{ type: "spring", bounce: 0, duration: 0.25 }}
                  onClick={() => setTime(t)}
                >
                  {t}
                </motion.button>
              ))}
            </div>
            <p className="small-muted">
              Зачёркнутое время уже занято или прошло.
            </p>
            <div className="form-grid">
              <label>
                Город / район
                <div className="input-icon">
                  <MapPin size={15} />
                  <input
                    maxLength={100}
                    required
                    value={city}
                    onChange={(ev) => setCity(ev.target.value)}
                    placeholder="Москва, Хамовники"
                  />
                </div>
              </label>
              <label>
                Тип помещения
                <select
                  value={room}
                  onChange={(ev) => setRoom(ev.target.value)}
                >
                  <option>Квартира</option>
                  <option>Загородный дом</option>
                  <option>Студия</option>
                </select>
              </label>
              <label>
                Ваше имя
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="given-name"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  placeholder="Как к вам обращаться"
                />
              </label>
              <label>
                Телефон
                <PhoneInput value={phone} onChange={setPhone} />
              </label>
            </div>
            <AnimatePresence initial={false}>
              {error && (
                <motion.p
                  className="form-error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <Button type="submit" className="full-width" disabled={loading}>
              {loading ? "Сохраняем…" : "Выбрать это время"}
              {loading ? (
                <LoaderCircle
                  size={16}
                  className="booking-spinner"
                  aria-hidden="true"
                />
              ) : (
                <ArrowRight size={16} />
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
