#!/bin/bash

echo "🚀 Starting Hari Smriti Application..."
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if ! pgrep -x "mongod" > /dev/null
then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   Run: mongod"
    echo ""
    echo "   Or use MongoDB Atlas and update MONGODB_URI in backend/.env"
    echo ""
fi

# Start backend
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo "   Backend running on http://localhost:5000"
echo ""

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
echo "   Frontend running on http://localhost:5173"
echo ""

echo "✅ Both servers are running!"
echo ""
echo "📝 Next Steps:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Sign up as a Mentor first"
echo "   3. Sign up as a Devotee and select the mentor"
echo "   4. Start adding sadhna entries!"
echo ""
echo "⚙️  Configuration:"
echo "   - MongoDB: Update backend/.env with MONGODB_URI"
echo "   - WhatsApp: Add Twilio credentials to backend/.env"
echo ""
echo "🛑 To stop servers:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user to stop
wait
