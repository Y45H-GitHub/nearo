/**
 * Provider-agnostic payment interface — see ADR 0005. No code outside this
 * folder should assume a specific provider; Server Actions call these
 * methods, never a payment SDK directly.
 */
export type PaymentResult = { providerReference: string };

export interface PaymentProvider {
  chargeRental(bookingId: string, amount: number): Promise<PaymentResult>;
  refundRental(bookingId: string, amount: number): Promise<PaymentResult>;
  holdDeposit(bookingId: string, amount: number): Promise<PaymentResult>;
  releaseDeposit(bookingId: string, amount: number): Promise<PaymentResult>;
}
