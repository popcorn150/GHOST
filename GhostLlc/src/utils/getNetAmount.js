/**
 * Calculates the net amount after subtracting the company's cut based on currency and amount.
 *
 * @param options - An object containing the amount paid and currency used.
 * @returns The amount remaining after deducting the company's cut.
 */
export function getNetAmount({ amountPaid, currency }) {
  let companyCutPercent = 0;

  if (currency === "NGN") {
    if (amountPaid < 100_000) {
      companyCutPercent = 20;
    } else if (amountPaid >= 100_000) {
      companyCutPercent = 10;
    } else {
      // For amounts between 10,000 and 100,000, assume no cut for now.
      companyCutPercent = 0;
    }
  } else {
    // TODO: Define company cut rules for other currencies like USD, EUR, etc.
    // For example:
    // if (currency === 'USD') { ... }
  }

  const cutAmount = (companyCutPercent / 100) * amountPaid;
  return amountPaid - cutAmount;
}
