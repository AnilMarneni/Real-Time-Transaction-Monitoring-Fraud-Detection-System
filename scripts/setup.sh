#!/bin/bash

echo "🚀 Setting up Fraud Detection System..."

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

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p monitoring

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.yml up --build

echo "✅ Setup complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API Server: http://localhost:4000"
echo "🤖 ML Service: http://localhost:8000"
echo "📊 Grafana: http://localhost:3001 (admin/admin123)"
