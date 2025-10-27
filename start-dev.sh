#!/bin/bash

# Development startup script for Bihar Election Calculator

echo "========================================"
echo "Bihar Election Calculator - Dev Mode"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo ""
fi

# Start backend in background
echo "🚀 Starting backend server on port 3000..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend started successfully (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start"
    exit 1
fi

echo ""
echo "========================================"
echo "✅ Development environment ready!"
echo "========================================"
echo ""
echo "Backend API: http://localhost:3000"
echo "Backend Health: http://localhost:3000/health"
echo ""
echo "To test frontend:"
echo "  1. Open index.html in your browser"
echo "  2. Or run: python3 -m http.server 8000"
echo "     Then visit: http://localhost:8000"
echo ""
echo "To stop backend:"
echo "  kill $BACKEND_PID"
echo ""
echo "Press Ctrl+C to stop..."
echo ""

# Wait for user to stop
trap "echo ''; echo 'Stopping backend...'; kill $BACKEND_PID; exit 0" INT
wait $BACKEND_PID

