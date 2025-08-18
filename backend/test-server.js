// Simple test script to check for common issues
require('dotenv').config();

console.log('🔍 Testing environment and dependencies...');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('DB_USER:', process.env.DB_USER ? '✅ Set' : '❌ Missing');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Missing');
console.log('DB_CONNECT_STRING:', process.env.DB_CONNECT_STRING ? '✅ Set' : '❌ Missing');

// Check dependencies
console.log('\n📦 Checking dependencies...');
try {
  const express = require('express');
  console.log('✅ Express loaded');
} catch (error) {
  console.log('❌ Express error:', error.message);
}

try {
  const bcrypt = require('bcrypt');
  console.log('✅ bcrypt loaded');
} catch (error) {
  console.log('❌ bcrypt error:', error.message);
}

try {
  const jwt = require('jsonwebtoken');
  console.log('✅ jsonwebtoken loaded');
} catch (error) {
  console.log('❌ jsonwebtoken error:', error.message);
}

try {
  const helmet = require('helmet');
  console.log('✅ helmet loaded');
} catch (error) {
  console.log('❌ helmet error:', error.message);
}

try {
  const rateLimit = require('express-rate-limit');
  console.log('✅ express-rate-limit loaded');
} catch (error) {
  console.log('❌ express-rate-limit error:', error.message);
}

// Test JWT signing
console.log('\n🔐 Testing JWT functionality...');
try {
  if (process.env.JWT_SECRET) {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ test: 'data' }, process.env.JWT_SECRET);
    console.log('✅ JWT signing works');
  } else {
    console.log('❌ JWT_SECRET not set');
  }
} catch (error) {
  console.log('❌ JWT error:', error.message);
}

// Test bcrypt
console.log('\n🔐 Testing bcrypt functionality...');
try {
  const bcrypt = require('bcrypt');
  const hash = bcrypt.hashSync('test123', 10);
  const isValid = bcrypt.compareSync('test123', hash);
  console.log('✅ bcrypt hashing and comparison works');
} catch (error) {
  console.log('❌ bcrypt error:', error.message);
}

console.log('\n✅ Test completed!'); 