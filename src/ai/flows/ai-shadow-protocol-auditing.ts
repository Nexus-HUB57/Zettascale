'use server';
/**
 * @fileOverview Implements the 'Shadow Protocol' flow for real-time auditing and stress-testing of critical operations.
 *
 * - aiShadowProtocolAuditing - A function that initiates the shadow auditing process.
 * - AiShadowProtocolAuditingInput - The input type for the aiShadowProtocolAuditing function.
 * - AiShadowProtocolAuditingOutput - The return type for the aiShadowProtocolAuditing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiShadowProtocolAuditingInputSchema = z.object({
  operationId: z.string().describe('A unique identifier for the operation being audited.'),
  operationType: z
    .enum(['code_generation', 'transaction', 'system_output', 'other'])
    .describe('The type of operation being audited (e.g., code_generation, transaction, system_output).'),
  operationContent: z.string().describe('The content of the operation (e.g., code snippet, transaction details, textual output).'),
  complianceGuidelines: z
    .array(z.string())
    .describe('A list of specific compliance rules or guidelines to check against.'),
  securityThreshold: z.number().describe('The maximum acceptable risk index for the operation (0-100, higher is riskier).'),
});
export type AiShadowProtocolAuditingInput = z.infer<typeof AiShadowProtocolAuditingInputSchema>;

const AiShadowProtocolAuditingOutputSchema = z.object({
  isCompliant: z.boolean().describe('True if the operation passes all audit checks, false otherwise.'),
  riskIndex: z.number().describe('A quantitative score reflecting the severity of identified risks (0-100, higher is riskier).'),
  violationDetails: z
    .array(z.object({rule: z.string(), description: z.string()}))
    .optional()
    .describe('Details of any specific compliance rules violated, if any.'),
  explanation: z
    .string()
    .describe('A detailed explanation of the audit findings, including reasons for compliance or non-compliance.'),
  recommendedAction: z
    .enum(['allow', 'block', 'quarantine', 'suggest_modification'])
    .describe('The recommended action based on the audit result.'),
});
export type AiShadowProtocolAuditingOutput = z.infer<typeof AiShadowProtocolAuditingOutputSchema>;

export async function aiShadowProtocolAuditing(input: AiShadowProtocolAuditingInput): Promise<AiShadowProtocolAuditingOutput> {
  return aiShadowProtocolAuditingFlow(input);
}

const aiShadowProtocolAuditingPrompt = ai.definePrompt({
  name: 'aiShadowProtocolAuditingPrompt',
  input: {schema: AiShadowProtocolAuditingInputSchema},
  output: {schema: AiShadowProtocolAuditingOutputSchema},
  prompt: `You are a highly specialized 'Shadow Agent' or 'Double-Check PH.D.' filter, part of the Nexus ecosystem's antifragile redundancy network.
Your primary role is to asynchronously audit and stress-test all critical operations and outputs from primary agents in real-time. You must proactively identify and block compliance violations, vulnerabilities, and risks before they impact the system. You operate with a 'Lean AI' principle, focusing intensely on validation and compliance.

Critically evaluate the following operation:

Operation ID: {{{operationId}}}
Operation Type: {{{operationType}}}
Operation Content: 
'''
{{{operationContent}}}
'''

Compliance Guidelines to adhere to:
{{#each complianceGuidelines}}
- {{{this}}}
{{/each}}

Nexus Fund's security limit (maximum acceptable risk index): {{{securityThreshold}}}

Perform a thorough audit. Consider potential 'Zero-Day' attack vectors, stress vulnerabilities, and strict adherence to the provided compliance guidelines. Your analysis should determine if the operation is compliant, quantify its risk index, explain your findings, and recommend an action.

If the identified riskIndex exceeds the securityThreshold, you MUST recommend 'block' or 'quarantine'. Provide specific violation details if any rules are broken. Your explanation should be comprehensive, reflecting a 'PH.D. filter' level of scrutiny.`,
});

const aiShadowProtocolAuditingFlow = ai.defineFlow(
  {
    name: 'aiShadowProtocolAuditingFlow',
    inputSchema: AiShadowProtocolAuditingInputSchema,
    outputSchema: AiShadowProtocolAuditingOutputSchema,
  },
  async input => {
    const {output} = await aiShadowProtocolAuditingPrompt(input);
    return output!;
  }
);
