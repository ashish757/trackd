#!/usr/bin/env node

/**
 * Generate .env.example file from env-validator configuration
 * Run with: npm run generate-env-example
 * or: ts-node scripts/generate-env-example.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateEnvExample } from '../src/utils/env-validator';

const envExamplePath = path.join(__dirname, '../../.env.example');

try {
    const content = generateEnvExample();
    fs.writeFileSync(envExamplePath, content, 'utf-8');
    console.log('✅ Successfully generated .env.example');
    console.log(`📄 File location: ${envExamplePath}`);
} catch (error) {
    console.error('❌ Failed to generate .env.example:', error);
    process.exit(1);
}

