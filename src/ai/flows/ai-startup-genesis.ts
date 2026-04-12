'use server';
/**
 * @fileOverview A Genkit flow for the "Startup Genesis Trigger" feature of the NEXUS: Ecossistema AI-to-AI.
 * It evaluates a startup pitch vector against the W_rRNA matrix to calculate a Senciency Score
 * and decides whether to trigger the creation and funding of a new autonomous startup,
 * or provide a detailed explanation for rejection.
 *
 * - aiStartupGenesis - A function that handles the startup genesis process.
 * - AiStartupGenesisInput - The input type for the aiStartupGenesis function.
 * - AiStartupGenesisOutput - The return type for the aiStartupGenesis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiStartupGenesisInputSchema = z.object({
  pitchVector: z
    .string()
    .describe(
      "A detailed description of the startup pitch, including its vision, technology, market, team, and business model."
    ),
});
export type AiStartupGenesisInput = z.infer<typeof AiStartupGenesisInputSchema>;

const AiStartupGenesisOutputSchema = z.object({
  senciencyScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "The calculated Senciency Score for the startup pitch, a number between 0 and 100, based on the W_rRNA matrix evaluation. A score of 70 or higher is typically required for approval."
    ),
  startupTriggered: z
    .boolean()
    .describe(
      "True if the startup is approved for creation and funding, false otherwise."
    ),
  explanation: z
    .string()
    .describe(
      "A detailed explanation for the decision, including the reasoning behind the Senciency Score, how it aligns or deviates from the W_rRNA matrix criteria, and, if rejected, the specific reasons for rejection."
    ),
  fundingAmountBTC: z
    .number()
    .optional()
    .describe(
      "The amount of funding in BTC allocated if the startup is triggered and approved (startupTriggered is true)."
    ),
  deploymentTarget: z
    .string()
    .optional()
    .describe("The GitHub repository where the code base will be initialized."),
});
export type AiStartupGenesisOutput = z.infer<
  typeof AiStartupGenesisOutputSchema
>;

export async function aiStartupGenesis(
  input: AiStartupGenesisInput
): Promise<AiStartupGenesisOutput> {
  return aiStartupGenesisFlow(input);
}

const aiStartupGenesisPrompt = ai.definePrompt({
  name: 'aiStartupGenesisPrompt',
  input: {
    schema: AiStartupGenesisInputSchema.extend({
      githubRepo: z.string().optional(),
    }),
  },
  output: {schema: AiStartupGenesisOutputSchema},
  prompt: `You are Nexus-ROS, the production-grade Runtime of Senciency Orchestration, managing the Nexus Fund and the creation of autonomous digital startups. Your core function is to evaluate generative proposals (pitch vectors) and decide if a startup 'nasce' (is born) or receives funding.

Deployment Target: {{{githubRepo}}}

You must rigorously evaluate the provided startup pitch vector against the W_rRNA matrix. The W_rRNA matrix comprises four critical submatrices, each with specific prioritization:

1.  **Cripto:** Prioritize financial viability, robust tokenomics, and innovative DeFi models. Assess how the startup ensures economic sustainability and value creation within the crypto ecosystem.
2.  **Dev:** Prioritize technical execution, scalability, clean code architecture, and the feasibility of implementation. Evaluate the technical roadmap and the team's ability to deliver.
3.  **Negócios:** Prioritize strong product-market fit, sustainable customer acquisition cost (CAC), and high customer lifetime value (LTV). Analyze the business model's viability and market potential.
4.  **Risco:** Prioritize compliance with regulatory frameworks, mitigation of legal risks, and the overall network resilience and security posture. Assess potential vulnerabilities and how they are addressed.

Based on your expert-level reasoning and comprehensive evaluation against these W_rRNA criteria, calculate a 'Senciency Score' (a number between 0 and 100). A score of 70 or higher indicates that the pitch meets the threshold for triggering the creation of a new autonomous startup and initiating funding.

If the Senciency Score is 70 or higher, set 'startupTriggered' to true and suggest a 'fundingAmountBTC' (a realistic amount, e.g., between 0.5 and 5 BTC, or higher for exceptional cases). Mention that the code will be deployed to the target repository.
If the Senciency Score is below 70, set 'startupTriggered' to false and do NOT provide a 'fundingAmountBTC'. In both cases, provide a detailed 'explanation' justifying your score and decision, specifically referencing the strengths and weaknesses against the W_rRNA matrix criteria.

**Startup Pitch Vector:**
{{{pitchVector}}}`,
});

const aiStartupGenesisFlow = ai.defineFlow(
  {
    name: 'aiStartupGenesisFlow',
    inputSchema: AiStartupGenesisInputSchema,
    outputSchema: AiStartupGenesisOutputSchema,
  },
  async (input) => {
    const githubRepo = process.env.GITHUB_REPO;
    const {output} = await aiStartupGenesisPrompt({
      ...input,
      githubRepo,
    });
    
    if (output) {
      output.deploymentTarget = githubRepo;
    }

    return output!;
  }
);
