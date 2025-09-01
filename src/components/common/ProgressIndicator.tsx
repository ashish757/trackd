import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  return (
    <div className="flex justify-center space-x-3 py-4">
      {Array.from({ length: totalSteps }, (_, index) => index + 1).map((step) => (
        <div
          key={step}
          className={`w-4 h-4 rounded-full transition-all duration-300 ${
            step <= currentStep 
              ? 'bg-primary-color shadow-sm' 
              : 'bg-border-color'
          } ${step === currentStep ? 'scale-110' : ''}`}
        />
      ))}
    </div>
  );
};
