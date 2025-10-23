import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMultiStepForm, type SignUpFormData } from '../hooks/forms/useMultiStepForm';
import { ProgressIndicator } from '../components/common/ProgressIndicator';
import { MessageContainer } from '../components/common/Message';
import { NavigationButtons } from '../components/forms/NavigationButtons';
import { StepTransition } from '../components/forms/StepTransition';
import { NameStep } from '../components/forms/NameStep';
import { UsernameStep } from '../components/forms/UsernameStep';
import { EmailStep } from '../components/forms/EmailStep';
import { PasswordStep } from '../components/forms/PasswordStep';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock username validation (in real app, this would be an API call)
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock some taken usernames
    const takenUsernames = ['admin', 'test', 'user', 'movie', 'trackd'];
    return !takenUsernames.includes(username.toLowerCase());
  };

  const handleSubmit = async (data: SignUpFormData) => {
    await signUp(data.email, data.password, data.name, data.username);
    navigate('/');
  };

  const {
    currentStep,
    formData,
    localError,
    localWarning,
    usernameChecking,
    direction,
    handleChange,
    handleNext,
    handleBack
  } = useMultiStepForm({
    initialData: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: handleSubmit,
    checkUsernameAvailability
  });

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <NameStep
            name={formData.name}
            onChange={handleChange}
          />
        );

      case 2:
        return (
          <UsernameStep
            username={formData.username}
            onChange={handleChange}
            isChecking={usernameChecking}
          />
        );

      case 3:
        return (
          <EmailStep
            email={formData.email}
            onChange={handleChange}
          />
        );

      case 4:
        return (
          <PasswordStep
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            onChange={handleChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <Link to="/" className="flex items-center justify-center space-x-2">
            <Film className="h-12 w-12 text-primary-color" />
            <span className="text-3xl font-bold text-gradient">Trackd</span>
          </Link>
          
          {/* Progress indicator */}
          <ProgressIndicator currentStep={currentStep} totalSteps={4} />
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-3" noValidate>
            <div className="min-h-[200px] flex flex-col justify-center">
              <StepTransition currentStep={currentStep} direction={direction}>
                {getStepContent()}
              </StepTransition>
            </div>

            {/* Messages */}
            <div className="">
              <MessageContainer 
                error={localError || error || undefined} 
                warning={localWarning} 
              />
            </div>

            {/* Navigation Buttons */}
            <NavigationButtons
              currentStep={currentStep}
              isLoading={isLoading}
              isChecking={usernameChecking}
              onBack={handleBack}
              onNext={handleNext}
            />
          </form>
        </div>

        {/* Sign In Option */}
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="link link-accent font-medium hover:underline transition-all duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Demo Info */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center px-3 py-2 bg-background-secondary/50 border border-border-color/50 rounded-lg">
            <p className="text-xs text-text-muted">
              Demo: This creates a local account for demonstration purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
