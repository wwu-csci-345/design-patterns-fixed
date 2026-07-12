/*
 * TARGET INTERFACE
 *
 * This is the interface that the application's checkout logic expects.
 *
 * Any payment provider that implements PaymentProcessor can be used by
 * CheckoutService without requiring changes to CheckoutService itself.
 */
interface PaymentProcessor {
  pay(amountInDollars: number): void;
}

/*
 * MODERN PAYMENT PROCESSOR
 *
 * This class already matches the interface expected by the application,
 * so it can be used directly without an adapter.
 */
class ModernPaymentProcessor implements PaymentProcessor {
  pay(amountInDollars: number): void {
    console.log(
      `Modern payment processor charged $${amountInDollars.toFixed(2)}.`,
    );
  }
}

/*
 * LEGACY PAYMENT GATEWAY
 *
 * Assume this class comes from an older system or a third-party library.
 *
 * Its interface is incompatible with PaymentProcessor because:
 *
 * 1. It uses makePayment() instead of pay().
 * 2. It expects the amount in cents instead of dollars.
 * 3. It requires a currency code.
 *
 * We do not modify this class directly.
 */
class LegacyPaymentGateway {
  makePayment(amountInCents: number, currencyCode: string): void {
    console.log(
      `Legacy payment gateway processed ${amountInCents} cents in ${currencyCode}.`,
    );
  }
}

/*
 * ADAPTER
 *
 * LegacyPaymentAdapter makes LegacyPaymentGateway compatible with the
 * PaymentProcessor interface expected by the application.
 *
 * This is an object adapter because it uses composition:
 *
 * LegacyPaymentAdapter "has a" LegacyPaymentGateway.
 */
class LegacyPaymentAdapter implements PaymentProcessor {
  private readonly legacyGateway: LegacyPaymentGateway;
  private readonly currencyCode: string;

  constructor(legacyGateway: LegacyPaymentGateway, currencyCode: string) {
    this.legacyGateway = legacyGateway;
    this.currencyCode = currencyCode;
  }

  /*
   * This method matches the PaymentProcessor interface.
   *
   * The adapter translates the application's request into the format
   * required by the legacy gateway.
   */
  pay(amountInDollars: number): void {
    /*
     * The application uses dollars, but the legacy gateway expects cents.
     *
     * Math.round() reduces common floating-point conversion issues.
     * In production financial software, a dedicated money or decimal
     * type would normally be preferable.
     */
    const amountInCents = Math.round(amountInDollars * 100);

    /*
     * Delegate the actual payment processing to the legacy gateway.
     *
     * The adapter supplies:
     * - the converted amount
     * - the configured currency code
     */
    this.legacyGateway.makePayment(amountInCents, this.currencyCode);
  }
}

/*
 * CHECKOUT SERVICE
 *
 * CheckoutService depends only on the PaymentProcessor abstraction.
 *
 * It does not know:
 *
 * - whether the provider is modern or legacy
 * - which method the underlying provider uses
 * - whether the provider expects dollars or cents
 * - whether extra parameters are required
 *
 * Those integration details are hidden behind PaymentProcessor.
 */
class CheckoutService {
  private readonly paymentProcessor: PaymentProcessor;

  constructor(paymentProcessor: PaymentProcessor) {
    this.paymentProcessor = paymentProcessor;
  }

  /*
   * Perform a checkout using whichever PaymentProcessor implementation
   * was provided through the constructor.
   */
  checkout(amountInDollars: number): void {
    this.validateAmount(amountInDollars);

    console.log(`Starting checkout for $${amountInDollars.toFixed(2)}.`);

    /*
     * CheckoutService always uses the same method.
     *
     * It does not need provider-specific branches or separate methods
     * such as checkoutWithModernProcessor() or
     * checkoutWithLegacyGateway().
     */
    this.paymentProcessor.pay(amountInDollars);

    console.log('Checkout completed.');
  }

  /*
   * Shared business validation belongs in the checkout service because
   * it applies regardless of which payment provider is used.
   */
  private validateAmount(amountInDollars: number): void {
    if (!Number.isFinite(amountInDollars)) {
      throw new Error('The checkout amount must be a finite number.');
    }

    if (amountInDollars <= 0) {
      throw new Error('The checkout amount must be greater than zero.');
    }
  }
}

/*
 * APPLICATION SETUP: MODERN PROCESSOR
 *
 * ModernPaymentProcessor already implements PaymentProcessor, so it can be
 * passed directly to CheckoutService.
 */
const modernProcessor: PaymentProcessor = new ModernPaymentProcessor();

const modernCheckoutService = new CheckoutService(modernProcessor);

modernCheckoutService.checkout(49.99);

console.log('--------------------');

/*
 * APPLICATION SETUP: LEGACY GATEWAY
 *
 * LegacyPaymentGateway cannot be passed directly to CheckoutService because
 * it does not implement PaymentProcessor.
 */
const legacyGateway = new LegacyPaymentGateway();

/*
 * Wrap the legacy gateway in an adapter.
 *
 * The adapter now presents the PaymentProcessor interface expected by
 * CheckoutService.
 */
const adaptedLegacyProcessor: PaymentProcessor = new LegacyPaymentAdapter(
  legacyGateway,
  'USD',
);

/*
 * CheckoutService receives the adapter as if it were any other
 * PaymentProcessor implementation.
 */
const legacyCheckoutService = new CheckoutService(adaptedLegacyProcessor);

legacyCheckoutService.checkout(49.99);
