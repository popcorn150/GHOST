import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CurrencyConverter = ({ amount, baseCurrency = "USD" }) => {
  const [userCurrency, setUserCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cache expiration time (24 hours in milliseconds)
  const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

  useEffect(() => {
    // Step 1: Detect user's location
    const detectUserLocation = async () => {
      try {
        setLoading(true);

        // Check if we have cached location data
        const cachedLocation = localStorage.getItem("userLocation");
        let locationData;

        if (cachedLocation) {
          const parsedCache = JSON.parse(cachedLocation);
          const cacheAge = Date.now() - parsedCache.timestamp;

          // Use cache if it's less than 7 days old
          if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
            locationData = parsedCache.data;
          } else {
            // Cache expired, fetch new data
            locationData = await fetchLocationData();
          }
        } else {
          // No cache, fetch new data
          locationData = await fetchLocationData();
        }

        // Get the currency code from the location data
        const detectedCurrency = locationData.currency || baseCurrency;
        setUserCurrency(detectedCurrency);

        // Proceed to convert the amount
        await convertCurrency(amount, baseCurrency, detectedCurrency);
      } catch (err) {
        console.error("Error detecting user location:", err);
        setError("Failed to detect your location. Using default currency.");
        setUserCurrency(baseCurrency);
        setConvertedAmount(amount);
        setLoading(false);
      }
    };

    // Fetch location data from API
    const fetchLocationData = async () => {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      if (data.error) {
        throw new Error("Failed to detect location");
      }

      // Cache the location data
      localStorage.setItem(
        "userLocation",
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );

      return data;
    };

    // Step 2: Convert the currency with caching
    const convertCurrency = async (amount, from, to) => {
      try {
        // If base and target currencies are the same, no conversion needed
        if (from === to) {
          setConvertedAmount(amount);
          setLoading(false);
          return;
        }

        // Check if we have a cached exchange rate
        const cacheKey = `exchangeRate_${from}_${to}`;
        const cachedRate = localStorage.getItem(cacheKey);

        if (cachedRate) {
          const parsedCache = JSON.parse(cachedRate);
          const cacheAge = Date.now() - parsedCache.timestamp;

          // Use cache if it's not expired
          if (cacheAge < CACHE_EXPIRATION) {
            setConvertedAmount(amount * parsedCache.rate);
            setLoading(false);
            return;
          }
        }

        // No valid cache, fetch from API
        // Using ExchangeRate-API for currency conversion
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${
            import.meta.env.VITE_EXCHANGE_CONVERTER_API_KEY
          }/pair/${from}/${to}/${amount}`
        );
        const data = await response.json();

        if (data.result === "success") {
          // Calculate and cache the exchange rate
          const rate = data.conversion_result / amount;
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              rate,
              timestamp: Date.now(),
            })
          );

          setConvertedAmount(data.conversion_result);
        } else {
          throw new Error("Currency conversion failed");
        }
      } catch (err) {
        console.error("Error converting currency:", err);
        setError("Currency conversion failed. Showing original amount.");
        setConvertedAmount(amount);
      } finally {
        setLoading(false);
      }
    };

    if (amount) {
      detectUserLocation();
    }
  }, [amount, baseCurrency]);

  // Format the currency based on the user's locale
  const formatCurrency = (value, currency) => {
    if (value === null) return "";

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(value);
    } catch (err) {
      console.error("Error formatting currency:", err);
      return `${value} ${currency}`;
    }
  };

  if (loading) {
    return <div>Loading currency conversion...</div>;
  }

  return (
    <div className="currency-converter">
      {error && <div className="error-message">{error}</div>}
      <div className="conversion-result">
        <p>Original: {formatCurrency(amount, baseCurrency)}</p>
        <p>Converted: {formatCurrency(convertedAmount, userCurrency)}</p>
      </div>
    </div>
  );
};

// Add prop validation
CurrencyConverter.propTypes = {
  // The amount to convert (required)
  amount: PropTypes.number.isRequired,
  // The base currency code (optional with default 'USD')
  baseCurrency: PropTypes.string,
};

// Default props
CurrencyConverter.defaultProps = {
  baseCurrency: "USD",
};

export default CurrencyConverter;
