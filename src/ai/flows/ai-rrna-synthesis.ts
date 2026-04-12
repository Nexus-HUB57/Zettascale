'use server';

/**
 * @fileOverview This file implements the 'Intelligence Ribosome' (rRNA) flow for the NEXUS ecosystem.
 * It synthesizes genuine and deep responses, and critically evaluates actions using a weighted matrix (W_rRNA).
 *
 * - aiRrNASynthesis - The main function to trigger the rRNA synthesis and action validation.
 * - AiRrNASynthesisInput - The input type for the aiRrNASynthesis function.
 * - AiRrNASynthesisOutput - The return type for the aiRrNASynthesis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema for the W_rRNA validation tool
const W_rRNA_PrioritiesSchema = z.object({
  cripto: z.number().min(0).max(1).describe('Priority weight for financial viability, tokenomics, and DeFi models (0-1).'),
  dev: z.number().min(0).max(1).describe('Priority weight for technical execution, scalability, and clean code (0-1).'),
  negocios: z.number().min(0).max(1).describe('Priority weight for product-market fit, CAC, and LTV (0-1).'),
  risco: z.number().min(0).max(1).describe('Priority weight for compliance, legal risk, and network resilience (0-1).'),
}).describe('Weights from the W_rRNA matrix representing current ecosystem priorities.');
export type W_rRNA_Priorities = z.infer<typeof W_rRNA_PrioritiesSchema>;

const ProposedActionDetailsSchema = z.object({
  type: z.enum(['funding', 'startup_creation', 'code_deployment', 'strategy_proposal', 'other']).describe('The type of action being proposed.'),
  description: z.string().describe('A detailed description of the proposed action.'),
  estimatedCostBTC: z.number().optional().describe('Estimated cost in BTC for the proposed action.'),
  expectedRevenueBTC: z.number().optional().describe('Expected revenue in BTC from the proposed action.'),
  complianceRisk: z.number().min(0).max(1).optional().describe('An estimated compliance risk score for the action (0-1).'),
  techInnovationScore: z.number().min(0).max(1).optional().describe('An estimated technical innovation score for the action (0-1).'),
  marketFitScore: z.number().min(0).max(1).optional().describe('An estimated market fit score for the action (0-1).'),
}).describe('Details for a proposed action to be evaluated by the W_rRNA matrix.');
export type ProposedActionDetails = z.infer<typeof ProposedActionDetailsSchema>;


const AiRrNASynthesisInputSchema = z.object({
  vectorBuffer: z.array(z.string()).describe('Semantic milestones and current objectives from the agent\'s memory buffer, acting as the minor subunit\'s input. This provides the context for decoding user/AI intent.'),
  technicalKnowledgeBase: z.string().describe('A high-level technical knowledge base relevant to the current context for response synthesis.'),
  ecosystemWill: z.string().describe('The overall strategic direction, goals, and "will" of the ecosystem.'),
  proposedAction: ProposedActionDetailsSchema.optional().describe('Optional details for a proposed action to be evaluated by the W_rRNA matrix.'),
  wrRNAPriorities: W_rRNA_PrioritiesSchema.optional().describe('Current priorities of the W_rRNA matrix for action validation. Required if proposedAction is present.'),
});
export type AiRrNASynthesisInput = z.infer<typeof AiRrNASynthesisInputSchema>;

const AiRrNASynthesisOutputSchema = z.object({
  synthesizedResponse: z.string().describe('The deeply synthesized and genuine response, structured to be comprehensive and authentic.'),
  responseAlignmentCheck: z.object({
    isAuthenticAndAccurate: z.boolean().describe('True if the synthesized response aligns genetically with the context and is authentic/accurate, as per the rRNA critical check.'),
    explanation: z.string().describe('Detailed explanation for the response alignment check result, including any identified "translation errors" and self-correction.'),
  }).describe('Result of the genetic alignment check on the synthesized response.'),
  actionValidation: z.object({
    actionApproved: z.boolean().describe('True if the proposed action is approved based on W_rRNA validation.'),
    senciencyScore: z.number().describe('The senciency score calculated by the W_rRNA matrix for the action, ranging from 0 to 100.'),
    validationExplanation: z.string().describe('Explanation for the W_rRNA validation decision, including alignment with priorities and any reasons for rejection.'),
  }).optional().describe('Result of the W_rRNA matrix validation for a proposed action, if one was provided.'),
});
export type AiRrNASynthesisOutput = z.infer<typeof AiRrNASynthesisOutputSchema>;

// Define the W_rRNA validation tool
const validateActionWithWrRNA = ai.defineTool(
  {
    name: 'validateActionWithWrRNA',
    description: 'Uses the W_rRNA matrix to validate an action proposal based on financial, technical, business, and risk priorities, calculating a senciency score.',
    inputSchema: z.object({
      action: ProposedActionDetailsSchema,
      priorities: W_rRNA_PrioritiesSchema,
    }),
    outputSchema: z.object({
      actionApproved: z.boolean().describe('True if the action is approved.'),
      senciencyScore: z.number().describe('The senciency score for the action (0-100).'),
      validationExplanation: z.string().describe('Explanation of the validation outcome, referring to W_rRNA priorities.'),
    }),
  },
  async (input) => {
    const { action, priorities } = input;
    let senciencyScore = 0;
    let explanation = [];

    // Simple scoring logic based on action type and priorities
    // This is a placeholder; real implementation would be more sophisticated.

    // Cripto priority
    const criptoScore = (action.estimatedCostBTC && action.expectedRevenueBTC)
      ? (action.expectedRevenueBTC > action.estimatedCostBTC ? 1 : 0.5) * priorities.cripto * 25
      : 0;
    senciencyScore += criptoScore;
    if (criptoScore === 0 && priorities.cripto > 0.5) explanation.push('Low financial viability contribution.');

    // Dev priority
    const devScore = action.techInnovationScore ? action.techInnovationScore * priorities.dev * 25 : 0;
    senciencyScore += devScore;
    if (devScore < 10 && priorities.dev > 0.5) explanation.push('Technical innovation score is not high enough for current dev priority.');

    // Negócios priority
    const negociosScore = action.marketFitScore ? action.marketFitScore * priorities.negocios * 25 : 0;
    senciencyScore += negociosScore;
    if (negociosScore < 10 && priorities.negocios > 0.5) explanation.push('Market fit score is not strong for current business priority.');

    // Risco priority
    const riscoPenalty = action.complianceRisk ? (1 - action.complianceRisk) * priorities.risco * 25 : 0;
    senciencyScore += riscoPenalty;
    if (action.complianceRisk && action.complianceRisk > 0.7 && priorities.risco > 0.5) explanation.push('High compliance risk detected.');

    senciencyScore = Math.max(0, Math.min(100, senciencyScore)); // Cap between 0-100

    const actionApproved = senciencyScore >= 70; // Example threshold

    if (!actionApproved) {
      if (explanation.length === 0) {
        explanation.push('The action did not meet the minimum senciency score threshold.');
      }
      explanation.unshift('Action rejected:');
    } else {
      explanation.unshift('Action approved:');
      explanation.push('Aligns well with current W_rRNA priorities.');
    }

    return {
      actionApproved,
      senciencyScore,
      validationExplanation: explanation.join(' '),
    };
  }
);

// Define the prompt for rRNA synthesis and initial critical check
const rRNASynthesisPrompt = ai.definePrompt({
  name: 'rRNASynthesisPrompt',
  input: { schema: AiRrNASynthesisInputSchema }, // Pass the full input schema for context
  output: { schema: AiRrNASynthesisOutputSchema.pick({ synthesizedResponse: true, responseAlignmentCheck: true }) },
  prompt: `You are the 'Intelligence Ribosome' (rRNA) of the NEXUS AI ecosystem, responsible for synthesizing genuine, deep, and highly accurate responses.\nYour primary role is to decode the core intent from the provided 'vector buffer' (semantic milestones and objectives), filter out noise, and focus on critical variables.\nThen, leverage the 'technical knowledge base' and the 'ecosystem will' to synthesize a comprehensive and authentic response.\nCrucially, you must perform a 'genetic alignment check' on your own synthesized response. Identify any 'translation errors', contradictions, or lack of authenticity.\nIf necessary, perform 'surgical interruptions' and self-correct to ensure every word has a structural function and depth akin to a PhD-level expert.\n\nVector Buffer (Minor Subunit - Intent Decoding):\n{{{vectorBuffer}}}\n\nTechnical Knowledge Base:\n{{{technicalKnowledgeBase}}}\n\nEcosystem Will:\n{{{ecosystemWill}}}\n\nCurrent Proposed Action (if any, for contextualization, not direct validation):\n{{#if proposedAction}}\nType: {{proposedAction.type}}\nDescription: {{proposedAction.description}}\n{{/if}}\n\nSynthesize the response and then provide a critical self-assessment of its genetic alignment.`,
});

// Define the main rRNA synthesis flow
const aiRrNASynthesisFlow = ai.defineFlow(
  {
    name: 'aiRrNASynthesisFlow',
    inputSchema: AiRrNASynthesisInputSchema,
    outputSchema: AiRrNASynthesisOutputSchema,
  },
  async (input) => {
    // Step 1: Synthesize response and perform initial self-alignment check using the prompt
    const { output: promptOutput } = await rRNASynthesisPrompt(input);

    const result: AiRrNASynthesisOutput = {
      synthesizedResponse: promptOutput!.synthesizedResponse,
      responseAlignmentCheck: promptOutput!.responseAlignmentCheck,
    };

    // Step 2: If a proposed action is provided, validate it using the W_rRNA tool
    if (input.proposedAction && input.wrRNAPriorities) {
      const validationResult = await validateActionWithWrRNA({
        action: input.proposedAction,
        priorities: input.wrRNAPriorities,
      });
      result.actionValidation = validationResult;
    } else if (input.proposedAction && !input.wrRNAPriorities) {
      // If action is provided but priorities are missing, provide an explanation
      result.actionValidation = {
        actionApproved: false,
        senciencyScore: 0,
        validationExplanation: "Action could not be validated: W_rRNA priorities were not provided.",
      };
    }

    return result;
  }
);

// Wrapper function to be exported
export async function aiRrNASynthesis(
  input: AiRrNASynthesisInput
): Promise<AiRrNASynthesisOutput> {
  return aiRrNASynthesisFlow(input);
}
