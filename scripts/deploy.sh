#!/bin/bash

echo "🚀 Deploying Fraud Detection System to Production..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build and deploy production services
echo "🔨 Building and deploying production services..."
docker-compose -f docker-compose.prod.yml up --build -d

echo "✅ Deployment complete!"
echo "🌐 Application is running in production mode"
echo "📊 Check monitoring dashboard: http://your-domain:3001"
