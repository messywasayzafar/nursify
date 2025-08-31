'use server';

/**
 * @fileOverview A smart referral assistant AI agent.
 *
 * - smartReferralAssistant - A function that handles the smart referral process.
 * - SmartReferralAssistantInput - The input type for the smartReferralAssistant function.
 * - SmartReferralAssistantOutput - The return type for the smartReferralAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StaffAvailabilitySchema = z.object({
  staffId: z.string().describe('The unique identifier of the staff member.'),
  name: z.string().describe('The name of the staff member.'),
  location: z.string().describe('The current location of the staff member (e.g., address, city).'),
  availability: z.string().describe('The availability schedule of the staff member.'),
  skills: z.string().describe('The skills of the staff member.'),
  patients: z.array(z.string()).describe('List of the staff member current patient IDs'),
});

const PatientInfoSchema = z.object({
  patientId: z.string().describe('The unique identifier of the patient.'),
  name: z.string().describe('The name of the patient.'),
  location: z.string().describe('The location of the patient (e.g., address, city).'),
  needs: z.string().describe('The specific needs of the patient (e.g., skilled nursing, physical therapy).'),
});

const SmartReferralAssistantInputSchema = z.object({
  patientInfo: PatientInfoSchema.describe('Information about the patient needing referral.'),
  availableStaff: z.array(StaffAvailabilitySchema).describe('List of available staff members and their information.'),
});

export type SmartReferralAssistantInput = z.infer<typeof SmartReferralAssistantInputSchema>;

const RecommendedStaffSchema = z.object({
  staffId: z.string().describe('The staff ID of the recommended staff member.'),
  reason: z.string().describe('The reason why this staff member is recommended.'),
});

const SmartReferralAssistantOutputSchema = z.object({
  recommendations: z.array(RecommendedStaffSchema).describe('List of recommended staff members for the patient.'),
});

export type SmartReferralAssistantOutput = z.infer<typeof SmartReferralAssistantOutputSchema>;

export async function smartReferralAssistant(input: SmartReferralAssistantInput): Promise<SmartReferralAssistantOutput> {
  return smartReferralAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartReferralAssistantPrompt',
  input: {schema: SmartReferralAssistantInputSchema},
  output: {schema: SmartReferralAssistantOutputSchema},
  prompt: `You are a smart referral assistant that helps assign staff to patients based on their location, availability, and needs.

  Given the following patient information:
  Patient ID: {{{patientInfo.patientId}}}
  Patient Name: {{{patientInfo.name}}}
  Patient Location: {{{patientInfo.location}}}
  Patient Needs: {{{patientInfo.needs}}}

  And the following available staff members:
  {{#each availableStaff}}
  Staff ID: {{{staffId}}}
  Staff Name: {{{name}}}
  Staff Location: {{{location}}}
  Availability: {{{availability}}}
  Skills: {{{skills}}}
  Current Patients: {{#each patients}}{{{this}}} {{/each}}
  {{/each}}

  Recommend the best staff member(s) to assign to the patient, considering their location, availability, skills, and current patient load. Explain the reasons for each recommendation. Respond in JSON format.
  `,
});

const smartReferralAssistantFlow = ai.defineFlow(
  {
    name: 'smartReferralAssistantFlow',
    inputSchema: SmartReferralAssistantInputSchema,
    outputSchema: SmartReferralAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
