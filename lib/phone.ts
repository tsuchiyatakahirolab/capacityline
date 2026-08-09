export const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function maskPhone(phone: string) {
  if (!E164_PATTERN.test(phone)) return "Invalid number";
  return `${phone.slice(0, Math.min(3, phone.length - 4))} ••• ••${phone.slice(-2)}`;
}

export function getAllowedNumbers() {
  return new Set(
    (process.env.CALLE_ALLOWED_NUMBERS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}
