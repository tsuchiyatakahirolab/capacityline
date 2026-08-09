export function getBillingConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  const priceId = process.env.STRIPE_PILOT_PRICE_ID?.trim() ?? "";
  const sessionSecret = process.env.BILLING_SESSION_SECRET?.trim() ?? "";

  return {
    secretKey,
    webhookSecret,
    priceId,
    sessionSecret,
    checkoutReady: Boolean(secretKey && priceId && sessionSecret.length >= 32),
    webhookReady: Boolean(secretKey && webhookSecret),
  };
}
