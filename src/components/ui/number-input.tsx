import { useEffect, useState } from "react";
import type { InputHTMLAttributes } from "react";
type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "onBlur" | "type"
> & { value: number; onCommit: (value: number) => boolean };
/** Editing text may be temporarily outside the room's valid range. Only commit complete values. */
export function NumberInput({ value, onCommit, ...props }: NumberInputProps) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    if (draft === String(value)) return;
    const n = draft.trim() === "" ? NaN : Number(draft);
    if (!onCommit(n)) setDraft(String(value));
  };
  return (
    <input
      {...props}
      type="number"
      value={draft}
      onChange={(ev) => setDraft(ev.target.value)}
      onBlur={commit}
      onKeyDown={(ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          commit();
        }
      }}
    />
  );
}
