#!/usr/bin/env node

/**
 * Setup Checker for justB
 * Run this script to verify your configuration before starting the app
 *
 * Usage: node check-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🥐 justB Setup Checker\n');
console.log('=' .repeat(50));

let hasErrors = false;
let hasWarnings = false;

// Check Node.js version
function checkNodeVersion() {
  const version = process.version;
  const majorVersion = parseInt(version.split('.')[0].substring(1));

  if (majorVersion >= 16) {
    console.log('✅ Node.js version:', version, '(Good!)');
  } else {
    console.log('❌ Node.js version:', version, '(Need v16+)');
    hasErrors = true;
  }
}

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');

  if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
    return true;
  } else {
    console.log('❌ .env file not found');
    console.log('   Copy .env.example to .env and configure it');
    hasErrors = true;
    return false;
  }
}

// Check .env configuration
function checkEnvConfig() {
  try {
    require('dotenv').config();

    const checks = [
      { key: 'MONGODB_URI', required: true },
      { key: 'JWT_SECRET', required: true },
      { key: 'STRIPE_SECRET_KEY', required: true },
      { key: 'STRIPE_PUBLISHABLE_KEY', required: true },
      { key: 'PORT', required: false }
    ];

    checks.forEach(({ key, required }) => {
      const value = process.env[key];

      if (!value || value.includes('your-') || value.includes('change-this')) {
        if (required) {
          console.log(`❌ ${key}: Not configured (REQUIRED)`);
          hasErrors = true;
        } else {
          console.log(`⚠️  ${key}: Not configured (optional)`);
          hasWarnings = true;
        }
      } else {
        console.log(`✅ ${key}: Configured`);
      }
    });

    // Check JWT secret strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.log('⚠️  JWT_SECRET: Should be at least 32 characters');
      hasWarnings = true;
    }

    // Check Stripe keys format
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      console.log('⚠️  STRIPE_SECRET_KEY: Should start with "sk_test_" or "sk_live_"');
      hasWarnings = true;
    }

    if (process.env.STRIPE_PUBLISHABLE_KEY && !process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
      console.log('⚠️  STRIPE_PUBLISHABLE_KEY: Should start with "pk_test_" or "pk_live_"');
      hasWarnings = true;
    }

  } catch (error) {
    console.log('❌ Error reading .env file:', error.message);
    hasErrors = true;
  }
}

// Check if node_modules exists
function checkDependencies() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');

  if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ Dependencies installed');
  } else {
    console.log('❌ Dependencies not installed');
    console.log('   Run: npm install');
    hasErrors = true;
  }
}

// Check required directories
function checkDirectories() {
  const dirs = [
    'server',
    'server/models',
    'server/routes',
    'server/controllers',
    'client',
    'client/css',
    'client/js'
  ];

  let allExist = true;
  dirs.forEach(dir => {
    if (!fs.existsSync(path.join(__dirname, dir))) {
      console.log(`❌ Missing directory: ${dir}`);
      allExist = false;
      hasErrors = true;
    }
  });

  if (allExist) {
    console.log('✅ All required directories exist');
  }
}

// Check MongoDB connection (optional)
async function checkMongoConnection() {
  try {
    require('dotenv').config();
    const mongoose = require('mongoose');

    console.log('⏳ Testing MongoDB connection...');

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB connection successful');
    await mongoose.connection.close();

  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('   Check your MONGODB_URI in .env');
    console.log('   Make sure MongoDB is running (if local)');
    hasErrors = true;
  }
}

// Main execution
async function main() {
  console.log('\n1. Checking Node.js version...');
  checkNodeVersion();

  console.log('\n2. Checking .env file...');
  const hasEnv = checkEnvFile();

  if (hasEnv) {
    console.log('\n3. Checking environment variables...');
    checkEnvConfig();
  }

  console.log('\n4. Checking dependencies...');
  checkDependencies();

  console.log('\n5. Checking project structure...');
  checkDirectories();

  if (hasEnv && !hasErrors) {
    console.log('\n6. Testing MongoDB connection...');
    await checkMongoConnection();
  }

  console.log('\n' + '='.repeat(50));

  if (hasErrors) {
    console.log('\n❌ Setup has ERRORS - Please fix the issues above');
    console.log('\n📖 See SETUP.md for detailed instructions\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  Setup complete with WARNINGS');
    console.log('   You can start the app, but review warnings above');
    console.log('\n📖 See SETUP.md for best practices\n');
  } else {
    console.log('\n✅ All checks passed! You\'re ready to go!');
    console.log('\n🚀 Start the app with: npm run dev');
    console.log('📖 See QUICKSTART.md for a quick tutorial\n');
  }
}

main().catch(error => {
  console.error('Error running setup checker:', error);
  process.exit(1);
});
