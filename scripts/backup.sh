#!/bin/bash

# Backup Script for Fraud Detection System
# This script creates automated backups of the database and important files

set -e

# Configuration
DB_HOST="postgres"
DB_PORT="5432"
DB_USER="${POSTGRES_USER:-admin}"
DB_PASSWORD="${POSTGRES_PASSWORD:-admin}"
DB_NAME="${POSTGRES_DB:-fraud_db}"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting backup process at $(date)"

# Database backup
echo "Creating database backup..."
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $DB_BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Database backup completed successfully: $DB_BACKUP_FILE"
    
    # Compress the backup
    gzip $DB_BACKUP_FILE
    echo "Database backup compressed: ${DB_BACKUP_FILE}.gz"
else
    echo "Database backup failed!"
    exit 1
fi

# Backup configuration files
echo "Backing up configuration files..."
CONFIG_BACKUP_DIR="$BACKUP_DIR/config_backup_$DATE"
mkdir -p $CONFIG_BACKUP_DIR

# Copy important configuration files
cp -r /app/.env* $CONFIG_BACKUP_DIR/ 2>/dev/null || true
cp -r /app/prisma $CONFIG_BACKUP_DIR/ 2>/dev/null || true
cp -r /app/logs $CONFIG_BACKUP_DIR/ 2>/dev/null || true

# Create archive of configuration
tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" -C $BACKUP_DIR "config_backup_$DATE"
rm -rf $CONFIG_BACKUP_DIR

echo "Configuration backup completed: config_backup_$DATE.tar.gz"

# Cleanup old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "config_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Verify backup
echo "Verifying latest backup..."
LATEST_DB_BACKUP=$(ls -t $BACKUP_DIR/db_backup_*.gz | head -1)
if [ -f "$LATEST_DB_BACKUP" ]; then
    BACKUP_SIZE=$(du -h "$LATEST_DB_BACKUP" | cut -f1)
    echo "Latest backup verified: $LATEST_DB_BACKUP (Size: $BACKUP_SIZE)"
else
    echo "Warning: No backup file found!"
    exit 1
fi

echo "Backup process completed successfully at $(date)"

# Optional: Upload to cloud storage (uncomment and configure)
# echo "Uploading backup to cloud storage..."
# aws s3 cp $LATEST_DB_BACKUP s3://your-backup-bucket/fraud-detection/
# aws s3 cp "$BACKUP_DIR/config_backup_$DATE.tar.gz" s3://your-backup-bucket/fraud-detection/

# Send notification (uncomment and configure)
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"✅ Database backup completed successfully for Fraud Detection System"}' \
#   $SLACK_WEBHOOK_URL

echo "Backup process finished. Total size: $(du -sh $BACKUP_DIR | cut -f1)"
