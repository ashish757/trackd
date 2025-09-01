import React, { useState, useEffect, useRef } from 'react';

interface StepTransitionProps {
  children: React.ReactNode;
  currentStep: number;
  direction: 'forward' | 'backward' | 'initial';
}

export const StepTransition: React.FC<StepTransitionProps> = ({
  children,
  currentStep,
  direction
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    const prevStep = prevStepRef.current;
    prevStepRef.current = currentStep;

    // Don't animate on initial load
    if (prevStep === currentStep && direction === 'initial') {
      setAnimationClass('animate-slide-in-initial');
      return;
    }

    // Don't animate if step hasn't changed
    if (prevStep === currentStep) {
      return;
    }

    setIsAnimating(true);
    
    if (direction === 'forward') {
      setAnimationClass('animate-slide-in-right');
    } else if (direction === 'backward') {
      setAnimationClass('animate-slide-in-left');
    } else {
      setAnimationClass('animate-slide-in-initial');
    }

    const timeout = setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [currentStep, direction]);

  return (
    <div 
      className={`step-transition ${animationClass} ${isAnimating ? 'animating' : ''}`}
      key={`step-${currentStep}`}
    >
      {children}
    </div>
  );
};
