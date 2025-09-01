import React from 'react';
import { Mail } from 'lucide-react';
import { FormField } from './FormField';
import { StepHeader } from './StepHeader';

interface EmailStepProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmailStep: React.FC<EmailStepProps> = ({ email, onChange }) => {
  return (
    <div className="space-y-6">
      <StepHeader
        currentStep={3}
        totalSteps={4}
        title="Optional - used for password reset"
        subtitle="Providing an email address can help with account recovery."
        stepLabel="Recovery Info"
      />
      <FormField
        id="email"
        name="email"
        type="email"
        label="Email Address"
        value={email}
        placeholder="Enter your email (optional)"
        autoComplete="email"
        autoFocus
        onChange={onChange}
        icon={Mail}
        helpText="We'll only use this for password recovery - completely optional"
      />
    </div>
  );
};
