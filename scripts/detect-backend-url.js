#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// URLs to test
const urlsToTest = [
  'http://localhost:3000/api',
  'http://127.0.0.1:3000/api',
  'http://localhost:5000/api',
  'https://psn.softsols.it.com/api'
];

// Test URL function
function testUrl(url) {
  return new Promise((resolve) => {
    const testEndpoint = `${url}/test`;

    exec(`curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${testEndpoint}"`, (error, stdout) => {
      if (stdout === '200') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Main function
async function detectBackendUrl() {
  console.log('🔍 Detecting backend URL...');

  for (const url of urlsToTest) {
    console.log(`Testing: ${url}`);
    const isReachable = await testUrl(url);

    if (isReachable) {
      console.log(`✅ Found working backend at: ${url}`);
      updateEnvFile(url);
      return;
    }
  }

  console.log('❌ No working backend found. Using default: http://localhost:3000/api');
  updateEnvFile('http://localhost:3000/api');
}

// Update .env file
function updateEnvFile(apiUrl) {
  const envPath = path.join(__dirname, '../.env');

  try {
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add API_BASE_URL
    const lines = envContent.split('\n');
    let updated = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('API_BASE_URL=') && !lines[i].startsWith('# API_BASE_URL=')) {
        lines[i] = `API_BASE_URL=${apiUrl}`;
        updated = true;
        break;
      }
    }

    if (!updated) {
      lines.push(`API_BASE_URL=${apiUrl}`);
    }

    // Add comment with detection timestamp
    const timestamp = new Date().toISOString();
    lines.push(`# Last detected on: ${timestamp}`);

    fs.writeFileSync(envPath, lines.join('\n'));
    console.log(`📝 Updated .env file with: ${apiUrl}`);

  } catch (error) {
    console.error('Error updating .env file:', error);
  }
}

// Run the detection
if (require.main === module) {
  detectBackendUrl();
}

module.exports = { detectBackendUrl, testUrl };