interface BillableSubscription {
  status: string;
  latest_invoice:
    | string
    | null
    | {
        status: string | null;
        amount_paid: number;
      };
  items: {
    data: Array<{
      price: {
        id: string;
        active: boolean;
        unit_amount: number | null;
      };
    }>;
  };
}

export function isPaidPilotSubscription(
  subscription: BillableSubscription,
  priceId: string,
) {
  const latestInvoice =
    typeof subscription.latest_invoice === "string" ? null : subscription.latest_invoice;
  const paidInvoice = latestInvoice?.status === "paid" && latestInvoice.amount_paid > 0;
  const paidPilotPrice = subscription.items.data.some(
    (item) =>
      item.price.id === priceId &&
      item.price.active &&
      typeof item.price.unit_amount === "number" &&
      item.price.unit_amount > 0,
  );

  return subscription.status === "active" && paidInvoice && paidPilotPrice;
}
