#!/bin/bash

echo "🔍 OBE Portal Status Check"
echo "=========================="

# Check if server is running
echo "📡 Checking server status..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running on http://localhost:3000"
else
    echo "❌ Server is not responding"
    exit 1
fi

# Check API endpoints
echo ""
echo "🔗 Testing API endpoints..."

# Colleges API
if curl -s http://localhost:3000/api/colleges > /dev/null; then
    echo "✅ Colleges API working"
else
    echo "❌ Colleges API failed"
fi

# Programs API
if curl -s http://localhost:3000/api/programs > /dev/null; then
    echo "✅ Programs API working"
else
    echo "❌ Programs API failed"
fi

# Login API
if curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"admin123"}' > /dev/null; then
    echo "✅ Login API working"
else
    echo "❌ Login API failed"
fi

echo ""
echo "👤 Sample Login Credentials:"
echo "Admin: admin@test.com / admin123"
echo "Teacher: bcse.head@cuiet.edu / teacher123"
echo "Student: john.doe@bcse.cuiet.edu / student123"

echo ""
echo "🌐 Access the application at: http://localhost:3000"