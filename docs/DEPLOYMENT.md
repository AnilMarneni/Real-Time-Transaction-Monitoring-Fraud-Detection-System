# Fraud Detection System Deployment Guide

## Overview

This guide covers deploying the Fraud Detection System in production using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Git
- Domain name (optional, for production)
- SSL certificate (optional, for production HTTPS)

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd fraud-detection-system
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Important Environment Variables:**
- `POSTGRES_PASSWORD`: Strong database password
- `JWT_SECRET`: Secure JWT secret key
- `GRAFANA_PASSWORD`: Grafana admin password

### 3. Deploy Services

```bash
# Make setup script executable
chmod +x scripts/setup.sh

# Run setup script
./scripts/setup.sh
```

Or manually:

```bash
# Development environment
docker-compose up --build

# Production environment
docker-compose -f docker-compose.prod.yml up --build -d
```

## Service URLs

After deployment, services will be available at:

- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:4000
- **ML Service**: http://localhost:8000
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090

## Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd fraud-detection-system

# Configure environment
cp .env.example .env
# Edit .env with production values

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. SSL Configuration (Optional)

For HTTPS, configure reverse proxy with Nginx:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Database Management

### Initial Setup

```bash
# Access database
docker exec -it fraud_postgres_prod psql -U admin -d fraud_db

# Run migrations
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

### Backups

```bash
# Create backup
./scripts/backup.sh

# Manual backup
docker exec fraud_postgres_prod pg_dump -U admin fraud_db > backup.sql

# Restore backup
docker exec -i fraud_postgres_prod psql -U admin fraud_db < backup.sql
```

## Monitoring

### Grafana Dashboard

1. Access Grafana at http://localhost:3001
2. Login with admin/admin123
3. Add Prometheus data source:
   - URL: http://prometheus:9090
   - Access: proxy

### Key Metrics

- **API Response Time**: Request latency
- **Error Rate**: Failed requests percentage
- **Active Users**: Concurrent users
- **Fraud Detection Rate**: Alerts per minute
- **Database Connections**: Active DB connections

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.prod.yml
services:
  api-server:
    deploy:
      replicas: 3
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
```

### Database Scaling

- **Read Replicas**: Configure PostgreSQL read replicas
- **Connection Pooling**: Increase pool size
- **Indexing**: Add database indexes for performance

## Security

### Environment Security

```bash
# Secure .env file
chmod 600 .env

# Use secrets management
# AWS Secrets Manager, HashiCorp Vault, etc.
```

### Network Security

```yaml
# docker-compose.prod.yml
networks:
  fraud_network:
    driver: bridge
    internal: true  # Internal only
```

### Application Security

- JWT secrets with 32+ characters
- Database passwords with 16+ characters
- Regular security updates
- SSL/TLS encryption
- Rate limiting configured

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :4000
   # Kill conflicting process
   sudo kill -9 <PID>
   ```

2. **Database Connection**
   ```bash
   # Check database logs
   docker logs fraud_postgres_prod
   
   # Test connection
   docker exec fraud_postgres_prod pg_isready -U admin
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase swap space
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs api-server
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f api-server
```

## Performance Optimization

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_transactions_user_id ON "Transaction"(userId);
CREATE INDEX idx_transactions_created_at ON "Transaction"(createdAt);
CREATE INDEX idx_alerts_severity ON "FraudAlert"(severity);
```

### Application Optimization

- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: Database connection management
- **Load Balancing**: Multiple API instances
- **CDN**: Static content delivery

## Maintenance

### Updates

```bash
# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml up --build -d

# Update dependencies
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks

```bash
# API health check
curl http://localhost:4000/api/health

# Service status
docker-compose ps
```
