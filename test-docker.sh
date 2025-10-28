#!/bin/bash

# Test Docker build and run with environment variables
# This simulates how Render will run your container

echo "========================================"
echo "Docker Build & Test (Render Simulation)"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with your database credentials."
    exit 1
fi

echo "📄 Loading environment variables from .env..."
export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)

# Verify required variables
REQUIRED_VARS=("DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables in .env:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Display configuration (hide password)
echo "📊 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Port: ${DB_PORT:-3306}"
echo ""

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t bihar-election . || {
    echo "❌ Docker build failed!"
    exit 1
}
echo "✅ Docker image built successfully"
echo ""

# Stop and remove existing container if running
echo "🧹 Cleaning up existing containers..."
docker stop bihar-election-test 2>/dev/null || true
docker rm bihar-election-test 2>/dev/null || true
echo ""

# Run Docker container with environment variables
echo "🚀 Starting Docker container..."
echo "   Container name: bihar-election-test"
echo "   Port: 3000"
echo ""

docker run -d \
  --name bihar-election-test \
  -p 3000:3000 \
  -e DB_HOST="$DB_HOST" \
  -e DB_USER="$DB_USER" \
  -e DB_PASSWORD="$DB_PASSWORD" \
  -e DB_NAME="$DB_NAME" \
  -e DB_PORT="${DB_PORT:-3306}" \
  -e MAX_PREDICTIONS_PER_IP="${MAX_PREDICTIONS_PER_IP:-5}" \
  bihar-election

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 3

# Check if container is running
if docker ps | grep -q bihar-election-test; then
    echo "✅ Container is running!"
    echo ""
    echo "========================================"
    echo "✅ Docker test successful!"
    echo "========================================"
    echo ""
    echo "🌐 Access your app at: http://localhost:3000"
    echo "🏥 Health check: http://localhost:3000/health"
    echo ""
    echo "📋 View logs:"
    echo "   docker logs bihar-election-test"
    echo ""
    echo "📋 Follow logs (live):"
    echo "   docker logs -f bihar-election-test"
    echo ""
    echo "🛑 Stop container:"
    echo "   docker stop bihar-election-test"
    echo ""
    echo "🧹 Remove container:"
    echo "   docker rm bihar-election-test"
    echo ""
    
    # Show initial logs
    echo "📋 Initial logs:"
    echo "----------------------------------------"
    docker logs bihar-election-test
    echo "----------------------------------------"
    echo ""
    
    # Test health endpoint
    echo "🏥 Testing health endpoint..."
    sleep 2
    curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/health
    echo ""
    echo ""
    
else
    echo "❌ Container failed to start!"
    echo ""
    echo "📋 Container logs:"
    docker logs bihar-election-test 2>&1
    exit 1
fi

