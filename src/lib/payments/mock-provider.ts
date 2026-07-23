import type { PaymentProvider, PaymentResult } from "@/lib/payments/provider";

/**
 * Mocked implementation — no real money moves (ADR 0005). Every call still
 * returns a real-looking reference so the resulting `payments` row is
 * indistinguishable in shape from what Razorpay would eventually produce.
 */
class MockPaymentProvider implements PaymentProvider {
  private async fabricate(prefix: string): Promise<PaymentResult> {
    return { providerReference: `mock_${prefix}_${crypto.randomUUID()}` };
  }

  chargeRental(): Promise<PaymentResult> {
    return this.fabricate("charge");
  }
  refundRental(): Promise<PaymentResult> {
    return this.fabricate("refund");
  }
  holdDeposit(): Promise<PaymentResult> {
    return this.fabricate("deposit_hold");
  }
  releaseDeposit(): Promise<PaymentResult> {
    return this.fabricate("deposit_release");
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
