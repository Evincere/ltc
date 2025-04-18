'use server';
/**
 * @fileOverview Generates a summary report based on AI price predictions and technical analysis.
 *
 * - summarizeReport - A function that generates a summary report.
 * - SummarizeReportInput - The input type for the summarizeReport function.
 * - SummarizeReportOutput - The return type for the summarizeReport function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getHistoricalPrice} from '@/services/coingecko';
import {getRedditPosts} from '@/services/reddit';
import {getOnChainMetrics} from '@/services/blockchair';

const SummarizeReportInputSchema = z.object({
  coinId: z.string().describe('The ID of the cryptocurrency (e.g., litecoin).'),
  currency: z.string().describe('The currency to retrieve the price in (e.g., usd).'),
  days: z.number().describe('The number of days of historical data to retrieve.'),
  subreddit: z.string().describe('The subreddit to retrieve posts from (e.g., Litecoin).'),
  sortBy: z.string().describe('The sorting method (e.g., relevance, new).'),
  limit: z.number().describe('The maximum number of posts to retrieve.'),
});
export type SummarizeReportInput = z.infer<typeof SummarizeReportInputSchema>;

const SummarizeReportOutputSchema = z.object({
  summary: z.string().describe('A summary report based on AI price predictions and technical analysis.'),
});
export type SummarizeReportOutput = z.infer<typeof SummarizeReportOutputSchema>;

export async function summarizeReport(input: SummarizeReportInput): Promise<SummarizeReportOutput> {
  return summarizeReportFlow(input);
}

const summarizeReportPrompt = ai.definePrompt({
  name: 'summarizeReportPrompt',
  input: {
    schema: z.object({
      historicalPriceData: z.string().describe('Historical price data for the cryptocurrency.'),
      redditPostsSentiment: z.string().describe('Sentiment analysis of Reddit posts related to the cryptocurrency.'),
      onChainMetricsData: z.string().describe('On-chain metrics for the cryptocurrency.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary report based on AI price predictions and technical analysis.'),
    }),
  },
  prompt: `You are an AI assistant that generates summary reports based on cryptocurrency data.

  Using the following data, generate a concise and informative report:

  Historical Price Data: {{{historicalPriceData}}}
  Reddit Posts Sentiment: {{{redditPostsSentiment}}}
  On-Chain Metrics: {{{onChainMetricsData}}}

  The report should include key insights and trends.
`,
});

const summarizeReportFlow = ai.defineFlow<
  typeof SummarizeReportInputSchema,
  typeof SummarizeReportOutputSchema
>(
  {
    name: 'summarizeReportFlow',
    inputSchema: SummarizeReportInputSchema,
    outputSchema: SummarizeReportOutputSchema,
  },
  async input => {
    const historicalPrice = await getHistoricalPrice(input.coinId, input.currency, input.days);
    const redditPosts = await getRedditPosts(input.subreddit, input.sortBy, input.limit);
    const onChainMetrics = await getOnChainMetrics(input.coinId);

    const historicalPriceData = JSON.stringify(historicalPrice);
    const redditPostsSentiment = JSON.stringify(redditPosts);
    const onChainMetricsData = JSON.stringify(onChainMetrics);

    const {output} = await summarizeReportPrompt({
      historicalPriceData,
      redditPostsSentiment,
      onChainMetricsData,
    });
    return output!;
  }
);
