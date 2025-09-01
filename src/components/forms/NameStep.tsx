import React from 'react';
import { User } from 'lucide-react';
import { FormField } from './FormField';
import { StepHeader } from './StepHeader';

interface NameStepProps {
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NameStep: React.FC<NameStepProps> = ({ name, onChange }) => {
  return (
    <div className="space-y-6">
      <StepHeader
        currentStep={1}
        totalSteps={4}
        title="Let's start with the basics"
        stepLabel="Personal Info"
      />
      <FormField
        id="name"
        name="name"
        type="text"
        label="What's your name?"
        value={name}
        placeholder="Enter your full name"
        autoComplete="name"
        autoFocus
        onChange={onChange}
        icon={User}
      />
    </div>
  );
};
