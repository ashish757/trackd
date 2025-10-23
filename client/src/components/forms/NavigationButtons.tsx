import React from 'react';
import { ArrowLeft, ArrowRight, Check, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavigationButtonsProps {
  currentStep: number;
  isLoading: boolean;
  isChecking?: boolean;
  onBack: () => void;
  onNext: () => void;
  finalStepText?: string;
  homeLink?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  isLoading,
  isChecking = false,
  onBack,
  onNext,
  finalStepText = 'GET STARTED',
  homeLink = '/'
}) => {
  const getButtonText = () => {
    if (currentStep === 4) {
      return isLoading ? 'Creating Account...' : finalStepText;
    }
    return 'Next';
  };

  const isDisabled = isLoading || isChecking;

  return (
    <div className="flex justify-between items-center pt-4">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary transition-all duration-200 hover:bg-background-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      ) : (
        <Link
          to={homeLink}
          className="btn btn-secondary transition-all duration-200 hover:bg-background-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        onClick={onNext}
      >
        {isLoading ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : currentStep === 4 ? (
          <Check className="h-5 w-5" />
        ) : (
          <ArrowRight className="h-5 w-5" />
        )}
        {getButtonText()}
      </button>
    </div>
  );
};
