import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Configuração do Genkit para o Ecossistema Nexus.
 * Calibrado para o modelo gemini-1.5-flash para máxima eficiência.
 * STATUS: PRODUCTION_READY - FIXED 404 MODEL ID
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
