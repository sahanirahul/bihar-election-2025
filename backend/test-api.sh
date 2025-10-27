#!/bin/bash

# Test script for Bihar Election API
# Make sure server is running before executing this script

BASE_URL="http://localhost:3000"

echo "========================================"
echo "Bihar Election API Test Script"
echo "========================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
curl -s "$BASE_URL/health" | json_pp
echo -e "\n"

# Test 2: Get all predictions
echo "Test 2: Get all predictions"
curl -s "$BASE_URL/api/predictions" | json_pp
echo -e "\n"

# Test 3: Get prediction count
echo "Test 3: Get prediction count for current IP"
curl -s "$BASE_URL/api/predictions/count" | json_pp
echo -e "\n"

# Test 4: Add a prediction
echo "Test 4: Add a new prediction"
curl -s -X POST "$BASE_URL/api/predictions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "nda": 30,
    "mgb": 20,
    "others": 50
  }' | json_pp
echo -e "\n"

# Test 5: Get all predictions again
echo "Test 5: Get all predictions (after adding)"
curl -s "$BASE_URL/api/predictions" | json_pp
echo -e "\n"

echo "========================================"
echo "Tests completed!"
echo "========================================"

