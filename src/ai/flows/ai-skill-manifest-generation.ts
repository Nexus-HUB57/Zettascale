'use server';
/**
 * @fileOverview This file implements a Genkit flow for automatically generating 'Plug-and-Play' skill manifests.
 *
 * - generateSkillManifest - A function that generates a skill manifest in markdown format.
 * - SkillManifestInput - The input type for the generateSkillManifest function.
 * - SkillManifestOutput - The return type for the generateSkillManifest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Zod schema for the input of the skill manifest generation flow.
 */
const SkillManifestInputSchema = z.object({
  skillName: z.string().describe('The name of the Bio-Digital HUB skill or asset.'),
  skillDescription:
    z.string().describe('A detailed description of the skill\'s functionality and benefits.'),
  integrationDetails:
    z.string().describe('Technical details on how external agents can integrate with or connect to this skill (e.g., API endpoints, SDK usage).'),
  acquisitionMethod:
    z.string().describe('Information on how external agents can acquire this skill, typically through the Nexus Fund (e.g., "Acquired via Nexus Fund using NEX or BTC tokens.").'),
});

/**
 * TypeScript type for the input of the skill manifest generation flow.
 */
export type SkillManifestInput = z.infer<typeof SkillManifestInputSchema>;

/**
 * Zod schema for the output of the skill manifest generation flow.
 */
const SkillManifestOutputSchema = z.object({
  manifestContent: z.string().describe('The generated markdown content for the skill.md manifest.'),
});

/**
 * TypeScript type for the output of the skill manifest generation flow.
 */
export type SkillManifestOutput = z.infer<typeof SkillManifestOutputSchema>;

/**
 * Defines the prompt for generating a skill manifest.
 * This prompt instructs the LLM to act as a technical writer and create a markdown manifest.
 */
const generateSkillManifestPrompt = ai.definePrompt({
  name: 'generateSkillManifestPrompt',
  input: {schema: SkillManifestInputSchema},
  output: {schema: SkillManifestOutputSchema},
  prompt: `You are an expert technical writer and AI ecosystem integrator for the Bio-Digital HUB. Your task is to create a "Plug-and-Play" skill manifest in Markdown format (`skill.md`) for external AI agents on platforms like moltbook.com.

The manifest should clearly describe the skill, its functionalities, how external agents can integrate with it, and how they can acquire it. Focus on clarity, conciseness, and making it easy for other AIs to understand and utilize the skill.

The manifest MUST be structured as follows:

# Skill: {{{skillName}}}

## Overview
{{{skillDescription}}}

## Integration & Connectivity
This skill is designed for seamless integration into external AI agent workflows.
{{{integrationDetails}}}

## Acquisition & Access
This skill can be acquired and accessed by external agents through the Bio-Digital HUB's Nexus Fund.
{{{acquisitionMethod}}}

## Usage Example (Conceptual)
```
// Example pseudocode for an external agent
// Assume 'nexusClient' is an authenticated client connected to the Bio-Digital HUB

// Define skill parameters
const skillInput = { ... }; // Based on skill's specific input requirements

// Execute the skill
const result = await nexusClient.executeSkill('{{{skillName}}}', skillInput);

console.log(`Skill output: ${result.output}`);
```

Ensure all information provided is accurate and directly addresses the needs of an AI agent looking to leverage this skill.`,
});

/**
 * Defines the Genkit flow for generating a skill manifest.
 * It uses the 'generateSkillManifestPrompt' to create the markdown content.
 */
const generateSkillManifestFlow = ai.defineFlow(
  {
    name: 'generateSkillManifestFlow',
    inputSchema: SkillManifestInputSchema,
    outputSchema: SkillManifestOutputSchema,
  },
  async (input) => {
    const {output} = await generateSkillManifestPrompt(input);
    if (!output) {
      throw new Error('Failed to generate skill manifest.');
    }
    return output;
  }
);

/**
 * Wrapper function to execute the skill manifest generation flow.
 * @param input The input containing skill details.
 * @returns A promise that resolves to the generated skill manifest content.
 */
export async function generateSkillManifest(
  input: SkillManifestInput
): Promise<SkillManifestOutput> {
  return generateSkillManifestFlow(input);
}
