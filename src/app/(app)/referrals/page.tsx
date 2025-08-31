import { SmartReferralAssistant } from '@/components/referrals/smart-referral-assistant';

export default function ReferralsPage() {
  return (
    <div className="flex-1 space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Smart Referral Assistant</h1>
      <SmartReferralAssistant />
    </div>
  );
}
