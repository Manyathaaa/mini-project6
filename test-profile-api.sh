#!/bin/bash

# Test Profile API Script
# This script tests the registration, login, and profile endpoints

BASE_URL="http://localhost:5000/api"

echo "========================================"
echo "Testing Authentication and Profile APIs"
echo "========================================"
echo ""

# Test 1: Register a new user
echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }')

echo "Response:"
echo $REGISTER_RESPONSE | jq '.' 2>/dev/null || echo $REGISTER_RESPONSE
echo ""

# Extract token from registration response
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
  echo "✅ Registration successful! Token received."
  echo "Token: ${TOKEN:0:50}..."
  echo ""
  
  # Test 2: Get Profile
  echo "2. Fetching user profile..."
  PROFILE_RESPONSE=$(curl -s -X GET ${BASE_URL}/auth/profile \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response:"
  echo $PROFILE_RESPONSE | jq '.' 2>/dev/null || echo $PROFILE_RESPONSE
  echo ""
  
  if echo $PROFILE_RESPONSE | jq -e '._id' > /dev/null 2>&1; then
    echo "✅ Profile API working correctly!"
  else
    echo "❌ Profile API failed or returned unexpected response"
  fi
else
  echo "❌ Registration failed. Testing login with existing user..."
  echo ""
  
  # Test 3: Login with test user
  echo "3. Logging in..."
  LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "john.doe@example.com",
      "password": "SecurePassword123"
    }')
  
  echo "Response:"
  echo $LOGIN_RESPONSE | jq '.' 2>/dev/null || echo $LOGIN_RESPONSE
  echo ""
  
  # Extract token from login response
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token' 2>/dev/null)
  
  if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
    echo "✅ Login successful! Token received."
    echo "Token: ${TOKEN:0:50}..."
    echo ""
    
    # Test 4: Get Profile after login
    echo "4. Fetching user profile..."
    PROFILE_RESPONSE=$(curl -s -X GET ${BASE_URL}/auth/profile \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response:"
    echo $PROFILE_RESPONSE | jq '.' 2>/dev/null || echo $PROFILE_RESPONSE
    echo ""
    
    if echo $PROFILE_RESPONSE | jq -e '._id' > /dev/null 2>&1; then
      echo "✅ Profile API working correctly!"
    else
      echo "❌ Profile API failed or returned unexpected response"
    fi
  else
    echo "❌ Login failed"
  fi
fi

echo ""
echo "========================================"
echo "Test completed"
echo "========================================"
