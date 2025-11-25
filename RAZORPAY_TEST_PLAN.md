# Razorpay Payment Gateway Test Plan

## 📋 **Overview**
This document provides a comprehensive testing strategy for the Razorpay payment integration in the Smart-Learn application.

## 🧪 **Test Configuration**

### **1. Environment Setup**
```bash
# Frontend (.env)
REACT_APP_USE_MOCK_PAYMENTS=true      # Set to 'false' for real payments
REACT_APP_RAZORPAY_KEY_ID=your_test_key

# Backend (.env)
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=test_webhook_secret
```

### **2. Test Modes**
- **Mock Mode** (Development): Simulated payments without real transactions
- **Test Mode** (Staging): Real Razorpay test environment with test credentials
- **Live Mode** (Production): Real transactions (NOT for testing)

---

## 🎯 **Test Scenarios**

### **A. Mock Payment Testing (Development)**

#### **✅ Test Case 1: Mock Payment Flow**
**Objective**: Verify complete payment flow without real money

**Steps:**
1. Navigate to `/pricing` page
2. Verify subscription status displays correctly
3. Click "Get Started" on Starter plan
4. Verify loading state appears (Processing...)
5. Wait 2 seconds for mock payment to complete
6. Verify success message appears
7. Verify subscription status updates to "Active Starter"

**Expected Results:**
- Loading spinner shows correctly
- Success toast appears with plan name
- Current plan status updates immediately
- Plan button shows "Current Plan" state

#### **✅ Test Case 2: Mock Payment Failure Simulation**
**Objective**: Test error handling with mock failures

**Steps:**
1. Open browser console
2. Manually simulate error by calling `paymentService.initiateMockPayment` with invalid options
3. Verify error handling works correctly

**Expected Results:**
- Error message displays appropriately
- Loading state clears
- User can retry payment

---

### **B. Real Razorpay Test Environment Testing**

#### **🧪 Prerequisites**
1. **Get Valid Test Credentials:**
   - Visit: https://dashboard.razorpay.com/app/keys
   - Copy Test Key ID (starts with `rzp_test_`)
   - Copy Test Key Secret

2. **Update Configuration:**
   ```bash
   REACT_APP_USE_MOCK_PAYMENTS=false
   ```

#### **✅ Test Case 3: Test Payment with Valid Credentials**
**Objective**: Verify real Razorpay integration

**Steps:**
1. Set `REACT_APP_USE_MOCK_PAYMENTS=false`
2. Use valid Razorpay test credentials
3. Navigate to pricing page
4. Click "Get Started" on any plan
5. Razorpay payment modal should open
6. Fill test payment details
7. Complete payment flow

**Test Payment Details:**
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits
Name: Test User
Email: test@example.com
Phone: 9876543210
```

**Expected Results:**
- Razorpay modal opens smoothly
- Payment form accepts test card details
- Payment processes successfully
- Backend verifies payment signature
- Subscription created in database
- User redirected to success state

#### **✅ Test Case 4: Payment Cancellation**
**Objective**: Test payment cancellation flow

**Steps:**
1. Initiate payment on any plan
2. When Razorpay modal opens, click "Close" or press ESC
3. Verify payment cancellation handling

**Expected Results:**
- Modal closes without completing payment
- Loading state clears
- User can try payment again
- No subscription created

#### **✅ Test Case 5: Invalid Payment Details**
**Objective**: Test invalid card details handling

**Steps:**
1. Open Razorpay payment modal
2. Enter invalid card details (e.g., expired card)
3. Attempt payment

**Expected Results:**
- Razorpay displays appropriate error
- Payment fails gracefully
- Error message shown to user
- No subscription created

---

### **C. Subscription Management Testing**

#### **✅ Test Case 6: Current Plan Display**
**Objective**: Verify subscription status display

**Steps:**
1. Complete a payment for any plan
2. Navigate to pricing page
3. Verify current plan indicator appears

**Expected Results:**
- Green badge shows "Current Plan: [Plan Name] - Active until [Date]"
- Correct plan button shows "Current Plan" state
- Other plans still show "Get Started"

#### **✅ Test Case 7: Plan Upgrades**
**Objective**: Test upgrading between plans

**Steps:**
1. Complete Starter plan payment
2. Click "Go Pro" for Pro plan
3. Complete Pro plan payment
4. Verify plan upgrade

**Expected Results:**
- New payment processes correctly
- Subscription updates to Pro plan
- Expiry date recalculated correctly

#### **✅ Test Case 8: Billing Cycle Changes**
**Objective**: Test monthly vs yearly billing

**Steps:**
1. Test monthly billing on Starter plan
2. Test yearly billing on Pro plan
3. Verify pricing calculations

**Expected Results:**
- Monthly: ₹299 (Starter), ₹799 (Pro)
- Yearly: ₹2,999 (Starter), ₹7,999 (Pro)
- Correct expiry dates set (30 days vs 365 days)

---

### **D. Edge Cases and Error Handling**

#### **✅ Test Case 9: Network Errors**
**Objective**: Test payment flow with network issues

**Steps:**
1. Disable internet connection
2. Click payment button
3. Enable connection and retry

**Expected Results:**
- Appropriate error message displayed
- Payment can be retried after connection restored

#### **✅ Test Case 10: Multiple Rapid Clicks**
**Objective**: Test button click debouncing

**Steps:**
1. Rapidly click payment button multiple times
2. Verify only one payment processes

**Expected Results:**
- Only one payment modal opens
- Multiple requests prevented
- Loading state prevents additional clicks

#### **✅ Test Case 11: Session Expiry**
**Objective**: Test payment with expired auth token

**Steps:**
1. Clear local storage (simulate token expiry)
2. Click payment button
3. Verify authentication flow

**Expected Results:**
- User redirected to login
- Payment can be retried after login

---

### **E. Security Testing**

#### **✅ Test Case 12: Payment Verification**
**Objective**: Ensure payment verification security

**Steps:**
1. Complete a payment
2. Check backend logs for signature verification
3. Verify tampered payments are rejected

**Expected Results:**
- All payments verified with Razorpay signatures
- Invalid signatures rejected
- Payment amounts match expected amounts

#### **✅ Test Case 13: SQL Injection Protection**
**Objective**: Test payment endpoint security

**Steps:**
1. Send malicious payloads to payment endpoints
2. Verify no SQL injection occurs

**Expected Results:**
- Malicious requests rejected
- Database integrity maintained

---

### **F. Performance Testing**

#### **✅ Test Case 14: Load Testing**
**Objective**: Test payment system under load

**Steps:**
1. Simulate multiple simultaneous payment requests
2. Monitor server performance
3. Verify all requests processed correctly

**Expected Results:**
- All payments processed successfully
- Rate limiting prevents abuse
- Server remains responsive

---

## 🔧 **Testing Tools & Commands**

### **Manual Testing Checklist:**
- [ ] Mock payments work correctly
- [ ] Real Razorpay test payments work
- [ ] All payment plans (Starter, Pro, Enterprise) function
- [ ] Billing cycle toggle works
- [ ] Current plan status displays
- [ ] Error handling works for all scenarios
- [ ] Loading states show correctly
- [ ] Subscription persists on page refresh

### **Automated Testing Commands:**
```bash
# Test payment endpoints directly
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"planType":"starter","billingCycle":"monthly"}'

# Check subscription status
curl -X GET http://localhost:3000/api/payment/subscription \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Database Verification:**
```sql
-- Check created subscriptions
SELECT * FROM subscriptions WHERE user_id = 'your_user_id';

-- Verify subscription status
SELECT plan_type, status, started_at, expires_at
FROM subscriptions
WHERE status = 'active';
```

---

## 📊 **Test Results Template**

| Test Case | Status | Pass/Fail | Notes |
|-----------|--------|-----------|-------|
| Mock Payment Flow | ✅ Tested | Pass | Working correctly |
| Payment Cancellation | ✅ Tested | Pass | Handled properly |
| Test Card Payment | ✅ Tested | Pass | Success |
| Invalid Card Details | ✅ Tested | Pass | Error shown |
| Plan Upgrades | ✅ Tested | Pass | Updated correctly |
| ... | ... | ... | ... |

---

## 🚨 **Production Readiness Checklist**

Before going live with real payments:

### **Configuration:**
- [ ] Valid Razorpay live credentials configured
- [ ] Webhook endpoints set up and tested
- [ ] SSL certificates installed
- [ ] CORS properly configured for production domain

### **Security:**
- [ ] API rate limits configured
- [ ] Payment signature verification active
- [ ] Input validation and sanitization
- [ ] Error logging and monitoring

### **Testing:**
- [ ] All test cases passed
- [ ] UAT completed with real users
- [ ] Load testing performed
- [ ] Security audit completed

### **Monitoring:**
- [ ] Payment success/failure tracking
- [ ] Error alerting configured
- [ ] Revenue analytics setup
- [ ] Backup payment methods considered

---

## 🔗 **Helpful Resources**

- **Razorpay Test Documentation**: https://razorpay.com/docs/test-data/
- **Test Credit Cards**: https://razorpay.com/docs/test-data/#test-cards
- **Webhook Testing**: https://webhook.site/ for testing webhooks
- **API Documentation**: https://razorpay.com/docs/api/

---

## 📞 **Support**

For any issues:
1. Check browser console for errors
2. Verify Razorpay credentials are correct
3. Ensure backend is running and accessible
4. Review this test plan for troubleshooting steps

---

*Last Updated: November 2025*
*Version: 1.0*