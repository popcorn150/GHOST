import { fetchExchangeRates } from "../utils/currency";

async function convertPriceToUSD(price, currency) {
  const rates = await fetchExchangeRates();
  if (!rates) return price; // If API fails, store as is
  const rate = rates[currency] || 1; // Default to 1 if currency is missing
  return price / rate; // Convert to USD
}

// Example usage when storing a product
async function saveProduct(product) {
  const { price, currency } = product;
  const priceInUSD = await convertPriceToUSD(price, currency);
  const newProduct = { ...product, price: priceInUSD, currency: "USD" };

  // Save newProduct to the database
}
