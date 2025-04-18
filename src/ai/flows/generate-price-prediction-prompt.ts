'use server';
/**
 * @fileOverview A flow to rephrase user prompts for better Litecoin price predictions.
 *
 * - generatePricePredictionPrompt - A function that rephrases the prompt.
 * - GeneratePricePredictionPromptInput - The input type for the generatePricePredictionPrompt function.
 * - GeneratePricePredictionPromptOutput - The return type for the generatePricePredictionPrompt function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePricePredictionPromptInputSchema = z.object({
  prompt: z.string().describe('The original user prompt.'),
});
export type GeneratePricePredictionPromptInput = z.infer<typeof GeneratePricePredictionPromptInputSchema>;

const GeneratePricePredictionPromptOutputSchema = z.object({
  rephrasedPrompt: z.string().describe('The rephrased prompt optimized for the Bi-LSTM model.'),
});
export type GeneratePricePredictionPromptOutput = z.infer<typeof GeneratePricePredictionPromptOutputSchema>;

export async function generatePricePredictionPrompt(input: GeneratePricePredictionPromptInput): Promise<GeneratePricePredictionPromptOutput> {
  return generatePricePredictionPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePricePredictionPromptPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('The original user prompt.'),
    }),
  },
  output: {
    schema: z.object({
      rephrasedPrompt: z.string().describe('The rephrased prompt optimized for the Bi-LSTM model.'),
    }),
  },
  prompt: `You are an AI assistant whose sole purpose is to rephrase user prompts so that a Bi-LSTM model can better predict the price of Litecoin.

Original Prompt: {{{prompt}}}

Rephrased Prompt:`,
});

const generatePricePredictionPromptFlow = ai.defineFlow<
  typeof GeneratePricePredictionPromptInputSchema,
  typeof GeneratePricePredictionPromptOutputSchema
>({
  name: 'generatePricePredictionPromptFlow',
  inputSchema: GeneratePricePredictionPromptInputSchema,
  outputSchema: GeneratePricePredictionPromptOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
