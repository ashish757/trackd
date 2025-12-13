/**
 * Email Service - Manual Test Script
 *
 * This script demonstrates the retry logic and email templates.
 * Run this with: npx ts-node scripts/test-email.ts
 *
 * Make sure RESEND_API_KEY is set in your .env file
 */

import { sendEmail } from '../src/utils/email';
import {
    otpTemplate,
    passwordResetTemplate,
    verifyChangeEmailTemplate,
    changeEmailRequestTemplate,
    emailChangedSuccessTemplate
} from '../src/utils/emailTemplates';

async function testEmailTemplates() {
    console.log('🧪 Testing Email Service with Retry Logic\n');

    const testEmail = process.env.TEST_EMAIL || 'ashishrajsingh75@gmail.com';
    const testName = 'Test User';

    console.log(`📧 Test email will be sent to: ${testEmail}\n`);

    // Test 1: OTP Email
    console.log('1️⃣  Testing OTP Email Template...');
    const otpResult = await sendEmail(
        testEmail,
        'Test: OTP Verification - Trackd',
        otpTemplate(testName, '123456')
    );
    console.log(`   Result: ${otpResult ? '✅ Success' : '❌ Failed'}\n`);

    // Wait a bit between emails
    await sleep(2000);

    // Test 2: Password Reset Email
    console.log('2️⃣  Testing Password Reset Email Template...');
    const resetLink = 'http://localhost:5173/forget-password?token=test-token-123';
    const resetResult = await sendEmail(
        testEmail,
        'Test: Password Reset - Trackd',
        passwordResetTemplate(testName, resetLink)
    );
    console.log(`   Result: ${resetResult ? '✅ Success' : '❌ Failed'}\n`);

    // Wait a bit between emails
    await sleep(2000);

    // Test 3: Email Verification Template
    console.log('3️⃣  Testing Email Verification Template...');
    const verifyLink = 'http://localhost:5173/change/email?token=verify-token-456';
    const verifyResult = await sendEmail(
        testEmail,
        'Test: Email Verification - Trackd',
        verifyChangeEmailTemplate(testName, verifyLink)
    );
    console.log(`   Result: ${verifyResult ? '✅ Success' : '❌ Failed'}\n`);

    // Wait a bit between emails
    await sleep(2000);

    // Test 4: Email Change Request Template
    console.log('4️⃣  Testing Email Change Request Template...');
    const newEmail = 'newemail@example.com';
    const requestResult = await sendEmail(
        testEmail,
        'Test: Email Change Request - Trackd',
        changeEmailRequestTemplate(testName, newEmail)
    );
    console.log(`   Result: ${requestResult ? '✅ Success' : '❌ Failed'}\n`);

    // Wait a bit between emails
    await sleep(2000);

    // Test 5: Email Change Success Template
    console.log('5️⃣  Testing Email Change Success Template...');
    const successResult = await sendEmail(
        testEmail,
        'Test: Email Successfully Updated - Trackd',
        emailChangedSuccessTemplate(testName, newEmail)
    );
    console.log(`   Result: ${successResult ? '✅ Success' : '❌ Failed'}\n`);

    console.log('✨ All tests completed!\n');
    console.log('📊 Summary:');
    const results = [otpResult, resetResult, verifyResult, requestResult, successResult];
    const successCount = results.filter(r => r).length;
    console.log(`   ✅ Successful: ${successCount}/5`);
    console.log(`   ❌ Failed: ${5 - successCount}/5`);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the tests
testEmailTemplates()
    .then(() => {
        console.log('\n✅ Test script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test script failed:', error);
        process.exit(1);
    });

