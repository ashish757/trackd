import React from 'react';
import { Lock } from 'lucide-react';
import { FormField } from './FormField';
import { StepHeader } from './StepHeader';

interface PasswordStepProps {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  onChange,
  onTogglePassword,
  onToggleConfirmPassword
}) => {
  return (
    <div className="space-y-6">
      <StepHeader
        currentStep={4}
        totalSteps={4}
        title="Security stronger than Steam"
        stepLabel="Security"
      />
      <div className="space-y-5">
        <FormField
          id="password"
          name="password"
          type="password"
          label="Password"
          value={password}
          placeholder="Create a password"
          autoComplete="new-password"
          autoFocus
          onChange={onChange}
          icon={Lock}
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
          helpText="Password must be at least 6 characters long"
        />

        <FormField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          placeholder="Confirm your password"
          autoComplete="new-password"
          onChange={onChange}
          icon={Lock}
          showPassword={showConfirmPassword}
          onTogglePassword={onToggleConfirmPassword}
        />
      </div>
    </div>
  );
};
