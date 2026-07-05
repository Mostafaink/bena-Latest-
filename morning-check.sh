#!/bin/bash

# Quick Morning Setup Script
# Run this when you wake up for instant status

echo "☀️  GOOD MORNING! Starting quick check..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Please run this from the project root directory"
  exit 1
fi

# Check if dev server is running
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "✅ Dev server is running on port 5174"
else
  echo "⚠️  Dev server not running, starting it..."
  npm run dev &
  sleep 5
fi

# Run status check
echo ""
echo "Running system status check..."
echo "================================"
node status-check.js
STATUS=$?

echo ""
echo "================================"

if [ $STATUS -eq 0 ]; then
  echo ""
  echo "🎉 EVERYTHING IS WORKING! 🎉"
  echo ""
  echo "Your app is at: http://localhost:5174"
  echo ""
  echo "Next steps:"
  echo "  1. Open http://localhost:5174 in your browser"
  echo "  2. Try creating an offer in the admin panel"
  echo "  3. See TESTING_CHECKLIST.md for full test suite"
  echo ""
else
  echo ""
  echo "⚠️  FIX REQUIRED"
  echo ""
  echo "SOLUTION:"
  echo "  1. Go to https://ezyjcnnhrlchdhsuzepj.supabase.co"
  echo "  2. Open SQL Editor"
  echo "  3. Run: supabase/FINAL_LOCALHOST_FIX.sql"
  echo "  4. Run this script again"
  echo ""
  echo "DETAILS:"
  echo "  See START_HERE.md for step-by-step instructions"
  echo ""
fi

echo "Files to read:"
echo "  • START_HERE.md              - Quick start guide"
echo "  • OVERNIGHT_SUMMARY.txt      - Visual status report"  
echo "  • TESTING_CHECKLIST.md       - Complete test suite"
echo ""
