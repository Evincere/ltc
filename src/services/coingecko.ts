/**
 * Represents historical price data for a cryptocurrency.
 */
export interface HistoricalPrice {
  /**
   * The timestamp of the price data.
   */
  timestamp: number;
  /**
   * The price of the cryptocurrency at the given timestamp.
   */
  price: number;
}

/**
 * Asynchronously retrieves historical price data for a given cryptocurrency.
 *
 * @param coinId The ID of the cryptocurrency (e.g., 'litecoin').
 * @param currency The currency to retrieve the price in (e.g., 'usd').
 * @param days The number of days of historical data to retrieve.
 * @returns A promise that resolves to an array of HistoricalPrice objects.
 */
export async function getHistoricalPrice(
  coinId: string,
  currency: string,
  days: number
): Promise<HistoricalPrice[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      timestamp: 1672531200000,
      price: 75.0,
    },
    {
      timestamp: 1672617600000,
      price: 76.5,
    },
  ];
}
