const API_KEY = "744b7cb711c84f34de72a706"; // Replace with your actual API key
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

export async function fetchExchangeRates() {
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    if (data.result === "success") {
      return data.conversion_rates; // Returns object { USD: 1, EUR: 0.92, NGN: 1500, etc. }
    } else {
      console.error("Failed to fetch exchange rates", data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
}
