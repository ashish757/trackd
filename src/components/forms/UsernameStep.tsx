import React from 'react';
import { AtSign } from 'lucide-react';
import { FormField } from './FormField';
import { StepHeader } from './StepHeader';

interface UsernameStepProps {
  username: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isChecking: boolean;
}

export const UsernameStep: React.FC<UsernameStepProps> = ({ 
  username, 
  onChange, 
  isChecking 
}) => {
  return (
    <div className="space-y-6">
      <StepHeader
        currentStep={2}
        totalSteps={4}
        title="Let's get some of your uniqueness here"
        stepLabel="Account Setup"
      />
      <FormField
        id="username"
        name="username"
        type="text"
        label="choose a username"
        value={username}
        placeholder="Choose a unique username"
        autoComplete="username"
        autoFocus
        onChange={onChange}
        icon={AtSign}
        isLoading={isChecking}
        helpText="Username must be unique and at least 3 characters"
      />
    </div>
  );
};
