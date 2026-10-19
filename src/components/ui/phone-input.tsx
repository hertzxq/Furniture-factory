import { useLayoutEffect, useRef } from "react";
import { formatPhone, phoneDigits } from "../../domain/phone";

export function PhoneInput({ value, onChange }: {
  value: string;
  onChange: (digits: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const formatted = formatPhone(value);

  useLayoutEffect(() => {
    if (caret.current === null || !input.current) return;
    let position = 0;
    let count = 0;
    while (position < formatted.length && count < caret.current) {
      if (/\d/.test(formatted[position])) count++;
      position++;
    }
    input.current.setSelectionRange(position, position);
    caret.current = null;
  }, [formatted]);

  return (
    <span className="phone-input">
      <span className="phone-prefix" aria-hidden="true">+7</span>
      <input
        ref={input}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        aria-label="Телефон"
        required
        pattern="[0-9]{3} [0-9]{3} [0-9]{2} [0-9]{2}"
        title="Введите 10 цифр номера после +7"
        placeholder="999 123 45 67"
        value={formatted}
        onChange={(event) => {
          const raw = event.target.value;
          const next = phoneDigits(raw);
          const before = raw.slice(0, event.target.selectionStart ?? raw.length).replace(/\D/g, "");
          caret.current = Math.min(next.length, before.length - (before.length > 10 && /^[78]/.test(before) ? 1 : 0));
          onChange(next);
        }}
        onKeyDown={(event) => {
          const field = event.currentTarget;
          const start = field.selectionStart ?? 0;
          if (start !== field.selectionEnd) return;
          const backward = event.key === "Backspace";
          const forward = event.key === "Delete";
          const adjacent = formatted[backward ? start - 1 : start];
          if ((!backward && !forward) || adjacent !== " ") return;
          event.preventDefault();
          const index = formatted.slice(0, start).replace(/\D/g, "").length - (backward ? 1 : 0);
          caret.current = index;
          onChange(value.slice(0, index) + value.slice(index + 1));
        }}
      />
      <input type="hidden" name="phone" value={value ? `+7${value}` : ""} />
    </span>
  );
}
