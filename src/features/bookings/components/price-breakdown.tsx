function money(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function PriceBreakdown({
  subtotalAmount,
  depositAmount,
  platformFeeAmount,
}: {
  subtotalAmount: number;
  depositAmount: number;
  /** Owner-view only — the fee is deducted from payout, not charged on top. */
  platformFeeAmount?: number | null;
}) {
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Rental</dt>
        <dd className="text-foreground">{money(subtotalAmount)}</dd>
      </div>
      {depositAmount > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Security deposit (refundable)</dt>
          <dd className="text-foreground">{money(depositAmount)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-border pt-2 font-medium">
        <dt className="text-foreground">Total (mock payment)</dt>
        <dd className="text-foreground">{money(subtotalAmount + depositAmount)}</dd>
      </div>
      {typeof platformFeeAmount === "number" && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <dt>Platform fee (deducted from your payout)</dt>
          <dd>-{money(platformFeeAmount)}</dd>
        </div>
      )}
    </dl>
  );
}
