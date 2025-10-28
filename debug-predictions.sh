#!/bin/bash

echo "========================================"
echo "🔍 Debug: Checking Predictions"
echo "========================================"
echo ""

# Check if container is running
if docker ps | grep -q bihar-election-test; then
    echo "✅ Container is running"
    echo ""
    
    # Check API response
    echo "📡 API Response from /api/predictions:"
    echo "----------------------------------------"
    curl -s http://localhost:3000/api/predictions | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/api/predictions
    echo ""
    echo "----------------------------------------"
    echo ""
    
    # Check prediction count
    echo "📊 Prediction Count:"
    echo "----------------------------------------"
    curl -s http://localhost:3000/api/predictions/count
    echo ""
    echo "----------------------------------------"
    echo ""
else
    echo "❌ Container is not running"
    echo "Run: ./test-docker.sh"
    exit 1
fi

# Also check database directly
echo "🗄️  Database Contents (Direct Query):"
echo "----------------------------------------"
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT id, name, nda_transfer, mgb_transfer, others_transfer FROM bihar_election_predictions LIMIT 5;" 2>/dev/null || echo "Failed to connect to database"
else
    echo "❌ .env file not found"
fi
echo "----------------------------------------"

