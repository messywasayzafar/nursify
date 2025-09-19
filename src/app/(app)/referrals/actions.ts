'use server';

import { patientForReferral, staffForReferral } from "@/lib/mock-data";

export async function getRecommendationsAction() {
  // Mock implementation
  return {
    recommendations: staffForReferral.map(staff => ({
      staffId: staff.staffId,
      reason: `Good match for ${patientForReferral.needs}`
    }))
  };
}
