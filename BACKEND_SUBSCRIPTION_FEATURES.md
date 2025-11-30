# Backend Subscription Features Implementation

## Overview
This document describes the complete implementation of subscription-based features for the SmartLearn backend, including quiz limits, file upload restrictions, analytics tiers, and PDF export functionality.

## Features Implemented

### 1. Subscription Limits Configuration
**File**: `src/config/subscription-limits.js`

**Plan Details**:
- **Free**: 3 quiz attempts/month, 5MB upload, 3-day history, basic analytics
- **Starter**: 10 quiz attempts/month, 10MB upload, 7-day history, basic analytics
- **Pro**: Unlimited quizzes, 100MB upload, 30-day history, advanced analytics + PDF export
- **Enterprise**: Unlimited everything, unlimited history, enterprise analytics + all features

### 2. Subscription Service
**File**: `src/services/subscription.service.js`

**Key Functions**:
- `getUserSubscription(userId)` - Gets user's current subscription with fallback to free tier
- `canAttemptQuiz(userId)` - Checks if user can attempt more quizzes this month
- `getMonthlyQuizAttempts(userId)` - Counts monthly quiz attempts
- `getCurrentMonthFileUsage(userId)` - Calculates current month file usage
- `cleanupOldRecords(userId, subscription)` - Removes old records based on retention policy

### 3. Subscription Middleware
**File**: `src/middleware/subscription.js`

**Available Middleware**:
- `checkQuizAttemptLimit` - Validates monthly quiz attempt limits
- `checkFileUploadLimit` - Enforces file size limits based on subscription
- `checkFeatureAccess(feature)` - Controls access to premium features
- `addSubscriptionData` - Adds subscription info to request object
- `applyHistoryRetention` - Cleans up old records automatically

### 4. Subscription Controller
**File**: `src/controllers/subscription.controller.js`

**Endpoints**:
- `GET /api/subscription/details` - Get subscription details and current usage
- `GET /api/subscription/usage` - Get detailed usage statistics
- `GET /api/subscription/check-permissions?action=X` - Check if user can perform specific action

### 5. Enhanced Quiz Controller
**Updates in**: `src/controllers/quiz.controller.js`

**New Features**:
- Monthly attempt limit enforcement
- Subscription info included in quiz submission response
- Tiered analytics (basic/advanced/enterprise)
- History retention filtering

### 6. Enhanced File Upload
**Updates in**: `src/routes/files.routes.js`

**Features**:
- Dynamic file size limits based on subscription
- Proper error messages for size violations
- Subscription-aware upload validation

### 7. PDF Export
**Files**:
- `src/controllers/export.controller.js`
- `src/routes/export.routes.js`

**Features**:
- Professional PDF reports with detailed results
- Available only for Pro+ users
- Complete quiz history and performance analysis

## API Endpoints

### Subscription Management
```bash
# Get subscription details and current usage
GET /api/subscription/details
Headers: Authorization: Bearer <token>

# Get detailed usage statistics
GET /api/subscription/usage
Headers: Authorization: Bearer <token>

# Check specific permissions
GET /api/subscription/check-permissions?action=attempt_quiz
GET /api/subscription/check-permissions?action=upload_file
GET /api/subscription/check-permissions?action=export_pdf
GET /api/subscription/check-permissions?action=advanced_analytics
Headers: Authorization: Bearer <token>
```

### Quiz Features with Limits
```bash
# Submit quiz (with monthly limit enforcement)
POST /api/quiz/:quizId/submit
Headers: Authorization: Bearer <token>
Body: { answers: [...] }

# Get analytics (tiered based on subscription)
GET /api/quiz/analytics?days=30
Headers: Authorization: Bearer <token>

# Get quiz results (with history retention)
GET /api/quiz/:quizId/results
Headers: Authorization: Bearer <token>
```

### File Upload with Limits
```bash
# Upload file (with size limits based on subscription)
POST /api/files/upload
Headers: Authorization: Bearer <token>
Body: multipart/form-data with file

# Size limits:
# Free: 5MB
# Starter: 10MB
# Pro: 100MB
# Enterprise: Unlimited
```

### PDF Export (Pro+ Only)
```bash
# Export quiz results to PDF
GET /api/export/quiz/:quizId/pdf
Headers: Authorization: Bearer <token>

# Returns: PDF file download
# Available for Pro and Enterprise users only
```

## Database Schema Updates

### Subscriptions Table
```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- 'starter', 'pro', 'enterprise'
  billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  amount INTEGER NOT NULL, -- in paise
  currency VARCHAR(3) DEFAULT 'INR',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Response Examples

### Subscription Details Response
```json
{
  "success": true,
  "data": {
    "subscription": {
      "planType": "pro",
      "status": "active"
    },
    "limits": {
      "quizAttemptsPerMonth": null,
      "fileUploadSizeMB": 100,
      "historyRetentionDays": 30,
      "analyticsLevel": "advanced",
      "canExportPDF": true,
      "features": ["unlimited_quiz", "advanced_analytics", "file_upload_100mb", "pdf_export"]
    },
    "usage": {
      "monthlyQuizAttempts": 15,
      "monthlyFileUsage": 45,
      "fileUploadLimit": 100
    },
    "canAttemptQuiz": true,
    "remainingAttempts": null
  }
}
```

### Quiz Submission with Subscription Info
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "attemptId": "uuid",
    "score": 85,
    "correctCount": 17,
    "totalCount": 20,
    "percentage": 85,
    "answers": [...],
    "subscriptionInfo": {
      "remainingAttempts": null,
      "monthlyLimit": null,
      "currentAttempts": 16
    }
  }
}
```

### Tiered Analytics Response
```json
{
  "success": true,
  "data": {
    "analyticsLevel": "advanced",
    "planType": "pro",
    "overview": {
      "totalQuizzes": 10,
      "totalAttempts": 25,
      "averageScore": 78,
      "successRate": 78
    },
    "recentQuizzes": [...],
    "dailyProgress": [...],
    "advancedAnalytics": {
      "difficultyDistribution": [...],
      "performanceTrends": [...]
    }
  }
}
```

## Error Handling

### Limit Exceeded Errors
```json
{
  "success": false,
  "error": "Monthly quiz attempt limit reached (3 attempts per month)",
  "code": "QUIZ_LIMIT_EXCEEDED",
  "data": {
    "currentAttempts": 3,
    "monthlyLimit": 3,
    "remainingAttempts": 0
  }
}
```

### File Size Limit Error
```json
{
  "success": false,
  "error": "File size exceeds your plan limit. Max allowed: 10MB, Your file: 15MB",
  "code": "FILE_SIZE_LIMIT_EXCEEDED",
  "data": {
    "maxFileSizeMB": 10,
    "fileSizeMB": 15,
    "planType": "starter"
  }
}
```

### Feature Access Error
```json
{
  "success": false,
  "error": "This feature requires a higher subscription plan",
  "code": "FEATURE_NOT_AVAILABLE",
  "data": {
    "requiredFeature": "pdf_export",
    "currentPlan": "starter",
    "availableFeatures": ["enhanced_quiz", "basic_analytics", "file_upload_10mb"]
  }
}
```

## Security Considerations

1. **Authentication**: All subscription-based endpoints require valid JWT tokens
2. **Authorization**: Features are enforced at middleware level
3. **Rate Limiting**: Quiz attempts limited per month per user
4. **Data Privacy**: User data automatically cleaned up based on retention policies
5. **Payment Verification**: Only paid users access premium features

## Performance Optimizations

1. **Database Indexes**: Optimized queries on user_id and dates
2. **Automatic Cleanup**: Old records removed automatically based on retention
3. **Caching**: Subscription data cached in request middleware
4. **Efficient Queries**: Batch operations for multiple records
5. **Pagination**: Large result sets properly paginated

## Testing Guide

### Test Quiz Limits
1. Create free user account
2. Submit 3 quizzes successfully
3. 4th quiz submission should fail with limit error
4. Upgrade to starter plan
5. Should be able to submit 10 quizzes per month

### Test File Upload Limits
1. Try uploading 6MB file as free user (should fail)
2. Upload 5MB file as free user (should succeed)
3. Upgrade to starter and upload 12MB file (should fail)
4. Upload 10MB file as starter (should succeed)

### Test Analytics Tiers
1. Free user gets basic analytics only
2. Pro user gets advanced analytics with difficulty distribution
3. Enterprise user gets enterprise analytics with performance insights

### Test PDF Export
1. Free user cannot access PDF export endpoint
2. Pro user can export quiz results to PDF
3. PDF includes detailed results and styling

## Deployment Notes

1. **Environment Variables**: Ensure all payment and subscription variables are set
2. **Database Migrations**: Subscriptions table and indexes will be created automatically
3. **Backup Strategy**: Backup payment and subscription data regularly
4. **Monitoring**: Monitor subscription usage and limits in production
5. **Cron Jobs**: Consider adding cleanup job for old records

## Future Enhancements

1. **Usage Notifications**: Email users when approaching limits
2. **Usage Dashboard**: Visual usage statistics for users
3. **Custom Plans**: Support for custom enterprise plans
4. **Usage Analytics**: Admin dashboard for usage metrics
5. **Automatic Upgrades**: Suggest plan upgrades based on usage patterns

This implementation provides a complete subscription-based system with proper access control, limits enforcement, and tiered features that scale with user plans.