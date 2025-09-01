import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Film, Mail, Lock, User, AtSign, Eye, EyeOff, Loader, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isLoading, error } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localWarning, setLocalWarning] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Mock username validation (in real app, this would be an API call)
  const checkUsernameAvailability = async (username: string) => {
    setUsernameChecking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUsernameChecking(false);
    
    // Mock some taken usernames
    const takenUsernames = ['admin', 'test', 'user', 'movie', 'trackd'];
    return !takenUsernames.includes(username.toLowerCase());
  };

  const handleNext = async () => {
    setLocalError('');
    setLocalWarning('');

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setLocalError('Please enter your name');
        return;
      }
      if (formData.name.trim().length < 2) {
        setLocalError('Name must be at least 2 characters long');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.username.trim()) {
        setLocalError('Please choose a username');
        return;
      }
      if (formData.username.length < 3) {
        setLocalError('Username must be at least 3 characters long');
        return;
      }
      
      const isAvailable = await checkUsernameAvailability(formData.username);
      if (!isAvailable) {
        setLocalError('Username is already taken. Please choose another one.');
        return;
      }
    }

    if (currentStep === 3) {
      if (formData.email && !formData.email.includes('@')) {
        setLocalError('Please enter a valid email address');
        return;
      }
      if (!formData.email) {
        setLocalWarning('Skipping email - you can add it later in settings');
      }
      // Email is optional, so we can proceed even if it's empty
    }

    if (currentStep === 4) {
      if (!formData.password) {
        setLocalError('Please enter a password');
        return;
      }
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters long');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }

      // Final step - submit the form
      try {
        await signUp(formData.email, formData.password, formData.name, formData.username);
        navigate('/');
        return;
      } catch (error) {
        // Error is handled by the auth context
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setLocalError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setLocalError('');
    setLocalWarning('');
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
               <div className="text-xs text-text-muted mt-4 uppercase tracking-wider">
                Step 1 of 4 • Personal Info
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">
                Let's start with the basics
              </h2>
             
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-3">
                What's your name?
              </label>
              <div className="relative">
                <User className="input-icon-left h-5 w-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-with-left-icon text-lg"
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-xs text-text-muted mt-4 uppercase tracking-wider">
                Step 2 of 4 • Account Setup
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">
                Let's get some of your uniqueness here
              </h2>
              
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-3">
                choose a username
              </label>
              <div className="relative">
                <AtSign className="input-icon-left h-5 w-5" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`input input-with-left-icon text-lg ${usernameChecking ? 'pr-12' : ''}`}
                  placeholder="Choose a unique username"
                  autoFocus
                />
                {usernameChecking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader className="h-5 w-5 animate-spin text-primary-color" />
                  </div>
                )}
              </div>
              <p className="text-xs text-text-muted mt-3 leading-relaxed">
                Username must be unique and at least 3 characters
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-xs text-text-muted mt-4 uppercase tracking-wider">
                Step 3 of 4 • Recovery Info
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">
                Optional - used for password reset
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Providing an email address can help with account recovery.
              </p>
              
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="input-icon-left h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-with-left-icon text-lg"
                  placeholder="Enter your email (optional)"
                  autoFocus
                />
              </div>
              <p className="text-xs text-text-muted mt-3 leading-relaxed">
                We'll only use this for password recovery - completely optional
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
               <div className="text-xs text-text-muted mt-4 uppercase tracking-wider">
                Step 4 of 4 • Security
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">
                Security stronger than Steam
              </h2>
             
            </div>
            <div className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-3">
                  Password
                </label>
                <div className="relative">
                  <Lock className="input-icon-left h-5 w-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-with-both-icons text-lg"
                    placeholder="Create a password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-icon-right"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-3 leading-relaxed">
                Password must be at least 6 characters long
              </p>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="input-icon-left h-5 w-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input input-with-both-icons text-lg"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="input-icon-right"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (currentStep === 4) {
      return isLoading ? 'Creating Account...' : 'GET STARTED';
    }
    return 'Next';
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
          <div className="flex justify-center space-x-3 py-4">
            {[1, 2, 3, 4].map((step) => (
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
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
            <div className="min-h-[200px] flex flex-col justify-center">
              {getStepContent()}
            </div>

            {/* Messages */}
            {(localError || error || localWarning) && (
              <div className="space-y-3">
                {(localError || error) && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-400 font-medium flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      {localError || error}
                    </p>
                  </div>
                )}
                {localWarning && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-sm text-yellow-400 font-medium flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      {localWarning}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary transition-all duration-200 hover:bg-background-secondary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <Link
                  to="/"
                  className="btn btn-secondary transition-all duration-200 hover:bg-background-secondary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Home
                </Link>
              )}

              <button
                type="submit"
                disabled={isLoading || usernameChecking}
                className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
          </form>
        </div>
        <br/>

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
