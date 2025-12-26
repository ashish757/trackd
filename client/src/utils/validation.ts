// Validation utility functions

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
} => {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong';

    // Only requirement: minimum 6 characters
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    // Calculate strength for indicator (but don't enforce)
    let strengthScore = 0;
    if (password.length >= 6) strengthScore++;
    if (password.length >= 8) strengthScore++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strengthScore++;
    if (/[0-9]/.test(password)) strengthScore++;
    if (/[^a-zA-Z0-9]/.test(password)) strengthScore++;

    if (strengthScore <= 2) strength = 'weak';
    else if (strengthScore <= 4) strength = 'medium';
    else strength = 'strong';

    return {
        isValid: errors.length === 0,
        errors,
        strength
    };
};

export const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
};

