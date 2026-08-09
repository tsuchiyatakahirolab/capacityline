import { createHmac, timingSafeEqual } from "node:crypto";

interface BillingTokenPayload {
  customerId: string;
  expiresAt: number;
}

const TOKEN_VERSION = "v1";

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createBillingToken(customerId: string, secret: string, now = Date.now()) {
  if (!customerId.startsWith("cus_") || secret.length < 32) {
    throw new Error("Billing session configuration is invalid.");
  }

  const payload: BillingTokenPayload = {
    customerId,
    expiresAt: now + 7 * 24 * 60 * 60 * 1_000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const unsigned = `${TOKEN_VERSION}.${encoded}`;
  return `${unsigned}.${sign(unsigned, secret)}`;
}

export function verifyBillingToken(token: string | undefined, secret: string, now = Date.now()) {
  if (!token || secret.length < 32) return null;
  const [version, encoded, signature] = token.split(".");
  if (version !== TOKEN_VERSION || !encoded || !signature) return null;

  const unsigned = `${version}.${encoded}`;
  const expected = Buffer.from(sign(unsigned, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as BillingTokenPayload;
    if (!payload.customerId?.startsWith("cus_") || payload.expiresAt <= now) return null;
    return payload.customerId;
  } catch {
    return null;
  }
}
