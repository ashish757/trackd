/**
 * Generate a random 6-digit OTP
 * @returns A string containing 6 random digits
 */
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP with custom length
 * @param length - Number of digits in OTP (default: 6)
 * @returns A string containing random digits
 */
export const generateCustomOTP = (length: number = 6): string => {
    if (length < 4 || length > 10) {
        throw new Error('OTP length must be between 4 and 10');
    }

    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;

    return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Validate OTP format
 * @param otp - OTP string to validate
 * @param expectedLength - Expected length of OTP (default: 6)
 * @returns boolean indicating if OTP is valid
 */
export const validateOTPFormat = (otp: string, expectedLength: number = 6): boolean => {
    const otpRegex = new RegExp(`^\\d{${expectedLength}}$`);
    return otpRegex.test(otp);
};

