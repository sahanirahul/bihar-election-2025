#!/bin/bash

# Quick script to check what's in the database

echo "========================================"
echo "Checking Database Contents"
echo "========================================"
echo ""

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
else
    echo "❌ .env file not found"
    exit 1
fi

echo "📊 Database: $DB_NAME"
echo "📍 Host: $DB_HOST"
echo ""

echo "🔍 Checking predictions table..."
echo ""

# Check if table exists and show structure
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "DESCRIBE bihar_election_predictions;" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Table 'bihar_election_predictions' doesn't exist yet"
    exit 1
fi

echo ""
echo "📋 Current predictions in database:"
echo "------------------------------------------------------------"
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT id, name, nda_transfer, mgb_transfer, others_transfer, created_at FROM bihar_election_predictions ORDER BY created_at DESC LIMIT 10;" 2>/dev/null

echo ""
echo "📊 Total predictions: "
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) as total FROM bihar_election_predictions;" 2>/dev/null

echo ""
echo "✅ Done!"

