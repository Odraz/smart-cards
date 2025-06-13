import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/googleai'; // Not needed for global instance if keys are per-flow

export const ai = genkit({
  plugins: [], // Remove googleAI() from here, it will be configured locally in flows with user API key
  // model: 'googleai/gemini-2.0-flash', // Default model removed as the providing plugin is removed globally
});
