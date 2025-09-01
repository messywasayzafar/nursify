'use server';

import { smartReferralAssistant } from "@/ai/flows/smart-referral-assistant";
import { patientForReferral, staffForReferral } from "@/lib/mock-data";

export async function getRecommendationsAction() {
  return await smartReferralAssistant({
    patientInfo: patientForReferral,
    availableStaff: staffForReferral,
  });
}
