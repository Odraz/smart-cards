
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating learning cards from text using the Gemini API.
 *
 * - generateCardsFromText - A function that accepts text, the number of cards to generate, and the language for the cards, then returns a set of generated flashcards.
 * - GenerateCardsFromTextInput - The input type for the generateCardsFromText function.
 * - GenerateCardsFromTextOutput - The return type for the generateCardsFromText function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { ai } from '@/ai/genkit'; // Import the global AI instance

const GenerateCardsFromTextInputSchema = z.object({
  text: z
    .string()
    .describe('The text to analyze and generate learning cards from.'),
  numberOfCards: z
    .number()
    .min(1)
    .max(16)
    .describe('The number of learning cards to generate (1-16).'),
  language: z.string().describe('The language for the generated cards.'),
  apiKey: z.string().describe('The Gemini API key provided by the user.'),
});
export type GenerateCardsFromTextInput = z.infer<
  typeof GenerateCardsFromTextInputSchema
>;

const GenerateCardsFromTextOutputSchema = z.object({
  cards: z.array(
    z.object({
      question: z.string().describe('The question for the learning card.'),
      answer: z.string().describe('The answer to the question.'),
    })
  ).describe('An array of generated learning cards.')
});

export type GenerateCardsFromTextOutput = z.infer<
  typeof GenerateCardsFromTextOutputSchema
>;

export async function generateCardsFromText(
  input: GenerateCardsFromTextInput
): Promise<GenerateCardsFromTextOutput> {
  return generateCardsFromTextFlow(input);
}

const safetySettings = [
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_LOW_AND_ABOVE',
  },
];

// Note: The global `ai.definePrompt` is not used here to allow dynamic API key usage.
// The prompt text is constructed manually, and `generate` is called on a custom AI instance.

const generateCardsFromTextFlow = ai.defineFlow( // Use the global 'ai' instance to define the flow
  {
    name: 'generateCardsFromTextFlow',
    inputSchema: GenerateCardsFromTextInputSchema,
    outputSchema: GenerateCardsFromTextOutputSchema,
  },
  async (input: GenerateCardsFromTextInput) => {
    // Create a Genkit AI instance specifically configured with the user's API key
    // The 'genkit' import is used here as a function to initialize a new instance
    const userSpecificAI = genkit({
      plugins: [googleAI({ apiKey: input.apiKey })],
      // The model can be specified here or in the generate call
    });

    const promptText = `You are an expert in creating study materials. Your task is to carefully analyze the following text and create exactly ${input.numberOfCards} of the most important learning cards from it. Important: All questions and answers must be formulated in the following language: ${input.language}. Return the result as a single JSON object containing a key 'cards', whose value is an array of objects with keys 'question' and 'answer'. Do not include any other text outside the JSON itself. The text to analyze follows: \n\n${input.text}`;

    const { output } = await userSpecificAI.generate({
      model: 'googleai/gemini-2.0-flash', // Ensure the model is specified
      prompt: promptText,
      output: {
        schema: GenerateCardsFromTextOutputSchema,
        format: 'json', // Request JSON output
      },
      config: {
        safetySettings: safetySettings,
      },
    });

    if (!output) {
      // Handle cases where output might be null or undefined, though Genkit usually throws for errors.
      // This can happen if the model's response doesn't match the schema despite requesting JSON.
      throw new Error('AI model did not return the expected output format.');
    }
    
    return output;
  }
);
