const axios = require('axios');

// Test password validation
const BASE_URL = 'http://localhost:8060';

// Test cases
const testCases = [
  { password: 'Pass1!', expected: true, description: 'Valid password' },
  { password: 'pass1!', expected: false, description: 'No uppercase' },
  { password: 'PASS1!', expected: false, description: 'No lowercase' },
  { password: 'Passss!', expected: false, description: 'No number' },
  { password: 'Pass123', expected: false, description: 'No special character' },
  { password: 'Pas1!', expected: false, description: 'Too short (5 chars)' },
  { password: 'Passw1!', expected: false, description: 'Too long (7 chars)' },
  { password: 'PASSW1!', expected: false, description: 'No lowercase, too long' },
];

console.log('🧪 Testing Password Validation Regex');
console.log('=====================================');

testCases.forEach(test => {
  const isValid = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6}$/.test(test.password);
  const result = isValid === test.expected ? '✅ PASS' : '❌ FAIL';
  console.log(`${result} ${test.description}: "${test.password}" (${isValid ? 'Valid' : 'Invalid'})`);
});

console.log('\n🚀 Testing API Endpoints...');
console.log('==========================');

async function testRegistration() {
  try {
    // Test invalid password
    console.log('\n1. Testing invalid password registration...');
    const invalidResponse = await axios.post(`${BASE_URL}/api/user/register`, {
      name: 'TestUser',
      email: 'test@example.com',
      pass: 'invalid' // This should fail validation
    });
    console.log('❌ Unexpected success with invalid password');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ Invalid password correctly rejected');
      console.log('   Message:', err.response.data.message);
    } else {
      console.log('❌ Unexpected error:', err.message);
    }
  }

  try {
    // Test valid password
    console.log('\n2. Testing valid password registration...');
    const validResponse = await axios.post(`${BASE_URL}/api/user/register`, {
      name: 'ValidUser',
      email: 'valid@example.com',
      pass: 'Pass1!' // This should pass validation
    });
    console.log('✅ Valid password accepted (OTP sent)');
    console.log('   Response:', validResponse.data.message);
  } catch (err) {
    if (err.response) {
      console.log('   Status:', err.response.status);
      console.log('   Message:', err.response.data.message);
    } else {
      console.log('❌ Error:', err.message);
    }
  }
}

// Run tests if server is running
testRegistration().catch(err => {
  console.log('⚠️  Server not running or connection failed');
  console.log('   Please start the server and run this test again');
});