export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return (digits.length > 10 && /^[78]/.test(digits) ? digits.slice(1) : digits).slice(0, 10);
}

export function formatPhone(value: string): string {
  const digits = phoneDigits(value);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
    .filter(Boolean)
    .join(" ");
}
