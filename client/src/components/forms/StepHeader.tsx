import React from 'react';

interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  stepLabel: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
  stepLabel
}) => {
  return (
    <div className="text-center">
      <div className="text-xs text-text-muted mt-4 uppercase tracking-wider">
        Step {currentStep} of {totalSteps} • {stepLabel}
      </div>
      <h2 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-text-secondary leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
