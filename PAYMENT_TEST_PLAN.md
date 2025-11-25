# Payment Integration Test Plan

## Overview
This document outlines the testing procedures for the integrated payment system between the SmartLearn frontend and backend using Razorpay.

## Environment Setup

### Backend Environment Variables
Ensure your `.env` file in `smartlearn-backend/backend/` contains:
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_Rk4Yk9UFk41gQO
RAZORPAY_KEY_SECRET=your_test_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Database (ensure PostgreSQL is running)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartlearn
DB_USER=postgres
DB_PASSWORD=your_password

# Other required variables...
```

### Frontend Environment Variables
The `.env` file in `smartlearn-frontend/` should contain:
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_Rk4Yk9UFk41gQO
# Set to 'true' to use mock payments for development, 'false' to use real Razorpay
REACT_APP_USE_MOCK_PAYMENTS=false
```

## Testing Modes

### 1. Mock Payment Testing (Development)
**Purpose**: Test UI/UX flow without actual payments
**Setup**: Set `REACT_APP_USE_MOCK_PAYMENTS=true`

**Test Steps**:
1. Start backend: `cd smartlearn-backend/backend && npm run dev`
2. Start frontend: `cd smartlearn-frontend && npm run dev`
3. Login to the application
4. Navigate to Pricing page
5. Click on any plan (Starter/Pro/Enterprise)
6. Select Monthly or Yearly billing
7. Click "Get Started" or similar button
8. Verify:
   - Loading state appears
   - After 2 seconds, success message appears
   - User's subscription status updates
   - Pricing page reflects the new plan

### 2. Real Razorpay Testing (Development/Production)
**Purpose**: Test complete payment flow with Razorpay test mode
**Setup**: Set `REACT_APP_USE_MOCK_PAYMENTS=false`

**Test Steps**:
1. Ensure backend is running with Razorpay credentials
2. Start frontend
3. Login to the application
4. Navigate to Pricing page
5. Select a plan and billing cycle
6. Click "Get Started"
7. Razorpay payment modal should appear
8. Use Razorpay test credentials:
   - Card Number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Name: Test User
   - Email: test@example.com
9. Complete payment
10. Verify:
    - Payment is processed
    - Backend creates subscription record
    - Frontend updates subscription status
    - Success message appears

## API Endpoint Testing

### Test Payment Flow via API
Use Postman/curl to test backend endpoints:

#### 1. Create Order
```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "starter",
    "billingCycle": "monthly"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "orderId": "order_XXXXXXXX",
    "amount": 29900,
    "currency": "INR",
    "planType": "starter",
    "billingCycle": "monthly"
  }
}
```

#### 2. Verify Payment (after Razorpay callback)
```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_XXXXXXXX",
    "razorpay_payment_id": "pay_XXXXXXXX",
    "razorpay_signature": "signature_XXXXXXXX",
    "planType": "starter",
    "billingCycle": "monthly"
  }'
```

#### 3. Get User Subscription
```bash
curl -X GET http://localhost:3000/api/payment/subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Verification

After successful payments, verify the database:
```sql
-- Check subscription record
SELECT * FROM subscriptions WHERE user_id = 'your_user_id' ORDER BY created_at DESC LIMIT 1;

-- Verify subscription details
SELECT
  plan_type,
  billing_cycle,
  status,
  amount,
  currency,
  started_at,
  expires_at
FROM subscriptions
WHERE user_id = 'your_user_id'
ORDER BY created_at DESC LIMIT 1;
```

## Pricing Validation

Verify the pricing matches between frontend and backend:

| Plan Type | Billing Cycle | Amount (₹) | Amount (Paise) |
|-----------|---------------|------------|----------------|
| Starter   | Monthly       | ₹299       | 29900          |
| Starter   | Yearly        | ₹2999      | 299900         |
| Pro       | Monthly       | ₹799       | 79900          |
| Pro       | Yearly        | ₹7999      | 799900         |
| Enterprise| Monthly       | ₹1999      | 199900         |
| Enterprise| Yearly        | ₹19999     | 1999900        |

## Error Handling Tests

### Test Error Scenarios:
1. **Invalid Plan Type**: Send non-existent plan
2. **Invalid Billing Cycle**: Send billing cycle other than monthly/yearly
3. **Payment Failure**: Cancel Razorpay payment modal
4. **Network Errors**: Test with offline network
5. **Authentication Errors**: Test without JWT token
6. **Expired Token**: Test with expired JWT

### Expected Error Responses:
```json
{
  "success": false,
  "error": "Invalid plan type",
  "code": "INVALID_PLAN"
}
```

## Frontend State Management

### Verify Redux Store Updates:
After successful payment, check:
- `userSubscription.subscription` contains the subscription data
- `userSubscription.planType` is updated
- UI components reflect the new subscription status

### Components to Verify:
1. **Pricing.tsx**: Plan buttons show correct states
2. **Dashboard.tsx**: Shows subscription status
3. **Navigation**: Updates based on subscription
4. **Quiz Generation**: Respects subscription limits

## Performance Tests

### Load Testing:
1. Multiple simultaneous payment requests
2. Rapid plan switching
3. Large subscription history queries

### Response Time Expectations:
- Payment order creation: < 2 seconds
- Payment verification: < 3 seconds
- Subscription status check: < 1 second

## Security Tests

### Verify Security Measures:
1. JWT authentication required for all payment endpoints
2. Signature verification for Razorpay webhooks
3. Input validation for plan types and amounts
4. SQL injection protection
5. CORS configuration

## Monitoring and Logging

### Check Logs For:
1. Payment creation success/failure
2. Payment verification attempts
3. Database operations
4. Razorpay API responses
5. Error details with timestamps

## Rollback Plan

### Test Rollback Scenarios:
1. Payment succeeded but database insertion failed
2. Database record created but payment verification failed
3. Webhook not received from Razorpay

### Compensation Strategies:
1. Manual subscription updates via admin
2. Webhook retry mechanisms
3. Database cleanup for failed payments

## Production Deployment Checklist

- [ ] Update Razorpay credentials to production
- [ ] Set `REACT_APP_USE_MOCK_PAYMENTS=false`
- [ ] Configure webhook endpoints in Razorpay dashboard
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Test production payment flow with small amounts
- [ ] Verify SSL certificates
- [ ] Test refund flow if applicable

## Troubleshooting Common Issues

### Payment Modal Not Loading
- Check Razorpay key configuration
- Verify network connectivity
- Check browser console for errors

### Order Creation Failed
- Verify backend environment variables
- Check database connection
- Review backend logs

### Payment Verification Failed
- Check Razorpay signature calculation
- Verify webhook configuration
- Review payment status in Razorpay dashboard

### Subscription Status Not Updating
- Check JWT token validity
- Verify database records
- Review frontend state management