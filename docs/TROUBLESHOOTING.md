# Troubleshooting Guide

## Common Issues and Solutions

### 1. Installation & Setup

#### Docker Issues

**Problem**: `docker: command not found`
```bash
# Solution: Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**Problem**: `docker-compose: command not found`
```bash
# Solution: Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Problem**: Port already in use
```bash
# Find process using port
netstat -tulpn | grep :4000

# Kill the process
sudo kill -9 <PID>

# Or use different port in .env
PORT=4001
```

#### Permission Issues

**Problem**: Permission denied errors
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker-compose up
```

### 2. Database Issues

#### Connection Problems

**Problem**: `ECONNREFUSED` database connection
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs fraud_postgres_prod

# Restart database
docker-compose restart postgres
```

**Problem**: Database migration failed
```bash
# Reset database (WARNING: This deletes all data)
docker-compose down
docker volume rm fraud-detection-system_postgres_data
docker-compose up postgres

# Run migrations
npx prisma migrate deploy
```

#### Performance Issues

**Problem**: Slow database queries
```bash
# Check database connections
docker exec fraud_postgres_prod psql -U admin -d fraud_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
docker exec fraud_postgres_prod psql -U admin -d fraud_db -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### 3. API Server Issues

#### Startup Problems

**Problem**: Server fails to start
```bash
# Check logs
docker-compose logs api-server

# Common issues:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
```

**Problem**: JWT authentication errors
```bash
# Check JWT_SECRET in .env
echo $JWT_SECRET

# Generate new secret
openssl rand -base64 32

# Update .env file
JWT_SECRET=your-new-secret-here
```

#### Runtime Issues

**Problem**: 500 Internal Server Error
```bash
# Check detailed logs
docker-compose logs -f api-server

# Check database connection
curl http://localhost:4000/api/health

# Verify environment variables
docker exec fraud_api_prod env | grep -E "(DATABASE|REDIS|JWT)"
```

**Problem**: Rate limiting errors
```bash
# Check rate limit status
curl -I http://localhost:4000/api/dashboard/metrics

# Reset Redis (if needed)
docker exec fraud_redis_prod redis-cli FLUSHALL
```

### 4. Frontend Issues

#### Build Problems

**Problem**: `npm install` fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Problem**: Build fails with TypeScript errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix specific errors
npx tsc --noEmit --pretty
```

#### Runtime Issues

**Problem**: API connection failed
```bash
# Check API server status
curl http://localhost:4000/api/health

# Check CORS configuration
curl -H "Origin: http://localhost:3000" http://localhost:4000/api/health

# Verify environment variables
echo $VITE_API_URL
```

**Problem**: WebSocket connection issues
```bash
# Test WebSocket connection
wscat -c ws://localhost:4000

# Check WebSocket logs
docker-compose logs api-server | grep -i websocket
```

### 5. ML Service Issues

#### Model Loading Problems

**Problem**: Model file not found
```bash
# Check if model exists
docker exec fraud_ml_prod ls -la model.joblib

# Train new model
docker exec fraud_ml_prod python train_model.py

# Check model training logs
docker logs fraud_ml_prod
```

**Problem**: Prediction service unavailable
```bash
# Check ML service health
curl http://localhost:8000/health

# Restart ML service
docker-compose restart ml-service

# Check dependencies
docker exec fraud_ml_prod pip list
```

### 6. Monitoring Issues

#### Prometheus Problems

**Problem**: Prometheus not collecting metrics
```bash
# Check Prometheus configuration
docker exec fraud_prometheus_prod cat /etc/prometheus/prometheus.yml

# Check target status
curl http://localhost:9090/api/v1/targets

# Reload configuration
curl -X POST http://localhost:9090/-/reload
```

#### Grafana Issues

**Problem**: Grafana can't connect to Prometheus
```bash
# Check Grafana logs
docker logs fraud_grafana_prod

# Test Prometheus connection from Grafana container
docker exec fraud_grafana_prod wget -qO- http://prometheus:9090/api/v1/query?query=up

# Restart Grafana
docker-compose restart grafana
```

### 7. Performance Issues

#### High Memory Usage

**Problem**: Out of memory errors
```bash
# Check memory usage
docker stats

# Check system memory
free -h

# Optimize Docker memory limits
# Add to docker-compose.yml:
services:
  api-server:
    mem_limit: 1g
    memswap_limit: 1g
```

#### High CPU Usage

**Problem**: High CPU consumption
```bash
# Check CPU usage
docker stats --no-stream

# Profile Node.js application
docker exec fraud_api_prod npm run profile

# Check for infinite loops
docker logs api-server | tail -100
```

### 8. Security Issues

#### Authentication Problems

**Problem**: Invalid JWT tokens
```bash
# Verify JWT token
# Use jwt.io or similar tool to decode

# Check token expiration
date +%s
# Compare with token exp claim

# Generate new token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

#### SSL/TLS Issues

**Problem**: Certificate errors
```bash
# Check certificate validity
openssl x509 -in cert.pem -text -noout

# Test SSL configuration
openssl s_client -connect localhost:443

# Generate self-signed certificate (for development)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

### 9. Data Issues

#### Data Corruption

**Problem**: Database corruption
```bash
# Check database integrity
docker exec fraud_postgres_prod pg_dump -U admin fraud_db > /tmp/backup.sql

# Restore from backup
# See backup.sh script

# Reinitialize database
docker-compose down
docker volume rm fraud-detection-system_postgres_data
docker-compose up postgres
npx prisma migrate deploy
npx prisma db seed
```

#### Data Sync Issues

**Problem**: Inconsistent data between services
```bash
# Check Kafka topic offsets
docker exec fraud_kafka_prod kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group transaction-group

# Reset consumer offsets
docker-compose restart kafka

# Verify data consistency
docker exec fraud_postgres_prod psql -U admin -d fraud_db -c "SELECT COUNT(*) FROM \"Transaction\";"
```

### 10. Debugging Tools

#### Logging

**Enable debug logging:**
```bash
# Set environment variable
export DEBUG=app:*

# Or in .env
DEBUG=app:*

# Check logs with debug level
docker-compose logs -f api-server
```

**Structured logging:**
```bash
# View application logs
docker-compose logs api-server | jq '.'

# Filter by log level
docker-compose logs api-server | grep ERROR
```

#### Health Checks

**Comprehensive health check:**
```bash
# API health
curl -f http://localhost:4000/api/health || echo "API unhealthy"

# Database health
docker exec fraud_postgres_prod pg_isready -U admin || echo "Database unhealthy"

# Redis health
docker exec fraud_redis_prod redis-cli ping || echo "Redis unhealthy"

# ML service health
curl -f http://localhost:8000/health || echo "ML service unhealthy"
```

### 11. Recovery Procedures

#### Service Recovery

**Full system restart:**
```bash
# Stop all services
docker-compose down

# Clean up
docker system prune -f

# Restart
docker-compose up -d
```

**Data recovery:**
```bash
# Create backup before recovery
./scripts/backup.sh

# Restore from latest backup
# Find latest backup
ls -la backups/ | tail -1

# Restore database
docker exec -i fraud_postgres_prod psql -U admin fraud_db < backup.sql
```

### 12. Getting Help

#### Log Collection

**Gather diagnostic information:**
```bash
# Create diagnostics bundle
mkdir -p diagnostics
docker-compose logs > diagnostics/docker-logs.txt
docker stats --no-stream > diagnostics/docker-stats.txt
docker version > diagnostics/docker-version.txt
systeminfo > diagnostics/system-info.txt 2>&1

# Compress for sharing
tar -czf diagnostics-$(date +%Y%m%d_%H%M%S).tar.gz diagnostics/
```

#### Support Information

When requesting support, include:
1. System information (OS, Docker version)
2. Error messages and logs
3. Steps to reproduce
4. Environment configuration (sanitized)
5. Diagnostic bundle

**Useful commands:**
```bash
# System info
uname -a
docker --version
docker-compose --version

# Application versions
curl http://localhost:4000/api/health
curl http://localhost:8000/health

# Network diagnostics
docker network ls
docker network inspect fraud-detection-system_fraud_network
```

## Prevention Tips

1. **Regular Backups**: Schedule automated backups
2. **Monitoring**: Set up alerts for critical metrics
3. **Updates**: Keep dependencies updated
4. **Documentation**: Document custom configurations
5. **Testing**: Test changes in development first
6. **Resource Monitoring**: Monitor resource usage trends
