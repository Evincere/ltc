/**
 * Represents on-chain metrics for a cryptocurrency.
 */
export interface OnChainMetrics {
  /**
   * The number of daily transactions.
   */
  dailyTransactions: number;
  /**
   * The average transaction fee.
   */
  averageTransactionFee: number;
  /**
   * The average coin age.
   */
  averageCoinAge: number;
}

/**
 * Asynchronously retrieves on-chain metrics for a given cryptocurrency.
 *
 * @param coinId The ID of the cryptocurrency (e.g., 'litecoin').
 * @returns A promise that resolves to an OnChainMetrics object.
 */
export async function getOnChainMetrics(coinId: string): Promise<OnChainMetrics> {
  // TODO: Implement this by calling an API.

  return {
    dailyTransactions: 100000,
    averageTransactionFee: 0.002,
    averageCoinAge: 150,
  };
}
