import { useState } from 'react';

export interface SignUpFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UseMultiStepFormProps {
  initialData: SignUpFormData;
  onSubmit: (data: SignUpFormData) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

export const useMultiStepForm = ({
  initialData,
  onSubmit,
  checkUsernameAvailability
}: UseMultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignUpFormData>(initialData);
  const [localError, setLocalError] = useState('');
  const [localWarning, setLocalWarning] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward' | 'initial'>('initial');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setLocalError('');
    setLocalWarning('');
  };

  const validateStep = async (step: number): Promise<boolean> => {
    setLocalError('');
    setLocalWarning('');

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setLocalError('Please enter your name');
          return false;
        }
        if (formData.name.trim().length < 2) {
          setLocalError('Name must be at least 2 characters long');
          return false;
        }
        break;

      case 2:
        if (!formData.username.trim()) {
          setLocalError('Please choose a username');
          return false;
        }
        if (formData.username.length < 3) {
          setLocalError('Username must be at least 3 characters long');
          return false;
        }
        
        setUsernameChecking(true);
        try {
          const isAvailable = await checkUsernameAvailability(formData.username);
          if (!isAvailable) {
            setLocalError('Username is already taken. Please choose another one.');
            return false;
          }
        } finally {
          setUsernameChecking(false);
        }
        break;

      case 3:
        if (formData.email && !formData.email.includes('@')) {
          setLocalError('Please enter a valid email address');
          return false;
        }
        if (!formData.email) {
          setLocalWarning('Skipping email - you can add it later in settings');
        }
        break;

      case 4:
        if (!formData.password) {
          setLocalError('Please enter a password');
          return false;
        }
        if (formData.password.length < 6) {
          setLocalError('Password must be at least 6 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setLocalError('Passwords do not match');
          return false;
        }
        break;
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    if (currentStep === 4) {
      try {
        await onSubmit(formData);
      } catch (error) {
        // Error handling is done by the parent component
      }
      return;
    }

    setDirection('forward');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setLocalError('');
    setLocalWarning('');
    setDirection('backward');
    setCurrentStep(prev => prev - 1);
  };

  return {
    currentStep,
    formData,
    localError,
    localWarning,
    usernameChecking,
    direction,
    handleChange,
    handleNext,
    handleBack,
    setCurrentStep
  };
};
