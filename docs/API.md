# Fraud Detection System API Documentation

## Overview

The Fraud Detection System provides a RESTful API for real-time fraud detection, transaction monitoring, and analytics.

## Base URL

- Development: `http://localhost:4000`
- Production: `https://your-domain.com`

## Authentication

All API endpoints (except authentication endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /api/auth/login
Login user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "role": "ANALYST",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/auth/register
Register new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "role": "ANALYST"
}
```

#### GET /api/auth/profile
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

### Transactions

#### POST /api/transactions
Create new transaction.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userId": "user-id",
  "amount": 100.50,
  "merchant": "Amazon",
  "location": "New York"
}
```

#### GET /api/transactions
Get transactions with filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit`: Number of transactions to return (default: 50)
- `offset`: Pagination offset (default: 0)
- `status`: Filter by status (pending, approved, flagged)
- `userId`: Filter by user ID

### Rules

#### GET /api/rules
Get all fraud detection rules.

**Headers:** `Authorization: Bearer <token>`

#### POST /api/rules
Create new fraud detection rule.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "High Value Transaction",
  "description": "Flag transactions over $10,000",
  "condition": "amount > 10000",
  "severity": "HIGH"
}
```

#### PUT /api/rules/:id
Update existing rule.

#### DELETE /api/rules/:id
Delete existing rule.

#### PATCH /api/rules/:id/toggle
Toggle rule active/inactive.

### Dashboard

#### GET /api/dashboard/metrics
Get dashboard metrics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalTransactions": 15420,
  "preventedFraud": 2847,
  "activeAlerts": {
    "critical": 3,
    "high": 12,
    "medium": 28,
    "low": 45
  },
  "trends": {
    "transactions": {
      "current": 15420,
      "previous": 14200,
      "change": 1220,
      "changePercent": 8.6
    }
  }
}
```

#### GET /api/dashboard/risk-trends
Get risk trends over time.

#### GET /api/dashboard/alerts
Get recent fraud alerts.

#### GET /api/dashboard/geographic-risk
Get geographic risk distribution.

### Analytics

#### GET /api/analytics/stats
Get analytics statistics.

#### GET /api/analytics/fraud-types
Get fraud type distribution.

#### GET /api/analytics/merchant-risk
Get merchant risk analysis.

#### GET /api/analytics/capture-rate
Get fraud capture rate trends.

### Alerts

#### GET /api/alerts
Get fraud alerts with filtering.

**Query Parameters:**
- `limit`: Number of alerts to return
- `offset`: Pagination offset
- `status`: Filter by status (pending, resolved)
- `severity`: Filter by severity (low, medium, high, critical)
- `timeRange`: Time range (1h, 24h, 7d, 30d)

#### PATCH /api/alerts/:id
Update alert status.

**Request Body:**
```json
{
  "action": "resolve" // or "dismiss", "review"
}
```

#### GET /api/alerts/:id
Get alert details.

### Settings

#### GET /api/settings/profile
Get user profile settings.

#### PUT /api/settings/profile
Update user profile.

#### GET /api/settings/preferences
Get user preferences.

#### PUT /api/settings/preferences
Update user preferences.

#### GET /api/settings/system
Get system settings (Admin only).

#### PUT /api/settings/system
Update system settings (Admin only).

### Health

#### GET /api/health
Basic health check.

#### GET /api/health/detailed
Detailed health check with service status.

#### GET /api/metrics
Prometheus metrics.

## WebSocket

Connect to WebSocket for real-time updates:

```
ws://localhost:4000
```

**Message Types:**
- `transaction:new`: New transaction created
- `alert:fraud`: New fraud alert detected

## Error Handling

All errors return JSON with error message:

```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

API endpoints are rate limited:
- General: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Transactions: 30 requests per minute

## Security

- All requests are sanitized for XSS prevention
- Security headers are automatically applied
- CORS is configured for allowed origins
- JWT tokens expire after 24 hours
