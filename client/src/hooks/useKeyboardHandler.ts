import { useEffect, type RefObject } from 'react';

/**
 * Custom hook to handle mobile keyboard behavior
 * Scrolls input fields into view when focused to mimic native app behavior
 *
 * @param inputRefs - Array of refs to input elements that should trigger scroll behavior
 */
export const useKeyboardHandler = (inputRefs: RefObject<HTMLElement | null>[]) => {
  useEffect(() => {
    // Check if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isMobile) return;

    const handleFocus = (ref: RefObject<HTMLElement | null>) => {
      if (!ref.current) return;

      // Small delay to wait for keyboard animation
      setTimeout(() => {
        if (!ref.current) return;

        // Get the input's position
        const rect = ref.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate if input is in lower half of screen
        const isInLowerHalf = rect.top > (windowHeight / 2) - 100;

        if (isInLowerHalf) {
          // Scroll the input into view with some padding
          ref.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 250); // 250ms delay matches typical keyboard animation
    };

    const listeners: Array<{ element: HTMLElement; handler: () => void }> = [];

    // Attach focus listeners to all input refs
    inputRefs.forEach(ref => {
      if (ref.current) {
        const handler = () => handleFocus(ref);
        ref.current.addEventListener('focus', handler);
        listeners.push({ element: ref.current, handler });
      }
    });

    // Cleanup listeners on unmount
    return () => {
      listeners.forEach(({ element, handler }) => {
        element.removeEventListener('focus', handler);
      });
    };
  }, [inputRefs]);
};

