#!/bin/bash

echo ""
echo "=========================================="
echo "  📚 Bibliotheca Library Management Setup"
echo "=========================================="
echo ""

# Check Node
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi

# Check MongoDB
if ! command -v mongod &>/dev/null && ! pgrep -x mongod &>/dev/null; then
  echo "⚠️  MongoDB not detected running. Make sure MongoDB is started."
  echo "   Install: https://www.mongodb.com/try/download/community"
  echo "   Start:   sudo systemctl start mongod  (Linux)"
  echo "            brew services start mongodb-community  (Mac)"
  echo ""
fi

echo "📦 Installing backend dependencies..."
cd backend && npm install
echo "✅ Backend ready"

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
echo "✅ Frontend ready"

echo ""
echo "🌱 Seeding admin user..."
cd ../backend && node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/library_management').then(async () => {
  const User = require('./models/User');
  const exists = await User.findOne({ email: 'admin@library.com' });
  if (!exists) {
    await User.create({ name: 'Admin', email: 'admin@library.com', password: 'admin123', role: 'admin' });
    console.log('✅ Admin created: admin@library.com / admin123');
  } else {
    console.log('ℹ️  Admin already exists: admin@library.com / admin123');
  }
  mongoose.disconnect();
}).catch(e => console.log('⚠️  Could not seed (MongoDB not running?)', e.message));
" 2>/dev/null

echo ""
echo "=========================================="
echo "  🚀 Starting Bibliotheca..."
echo "=========================================="
echo ""
echo "  Backend  →  http://localhost:5000"
echo "  Frontend →  http://localhost:3000"
echo ""
echo "  Login: admin@library.com / admin123"
echo ""
echo "  Press Ctrl+C to stop"
echo "=========================================="
echo ""

# Start backend in background
cd "$(dirname "$0")/backend"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
cd "$(dirname "$0")/frontend"
npm start &
FRONTEND_PID=$!

# Handle Ctrl+C
trap "echo ''; echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
