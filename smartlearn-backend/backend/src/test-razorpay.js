// Test Razorpay API directly
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: 'rzp_test_Rk4Yk9UFk41gQO',
  key_secret: '2PgpN0dl0z93rNDa3a1Rk1ZH',
});

console.log('Testing Razorpay API...');

// Test 1: Create a simple order
async function testOrderCreation() {
  try {
    console.log('🧪 Testing Razorpay Order Creation...');

    const options = {
      amount: 29900, // ₹299 in paise
      currency: 'INR',
      receipt: 'test_receipt_' + Date.now(),
      notes: {
        test: 'true',
        planType: 'starter',
        billingCycle: 'monthly'
      }
    };

    const order = await razorpay.orders.create(options);

    console.log('✅ Order created successfully!');
    console.log('Order ID:', order.id);
    console.log('Amount:', order.amount);
    console.log('Currency:', order.currency);
    console.log('Status:', order.status);

    return true;
  } catch (error) {
    console.error('❌ Order creation failed:');
    console.error('Status Code:', error.statusCode);
    console.error('Error:', error.error);
    console.error('Description:', error.error?.description);

    return false;
  }
}

// Test 2: Test Razorpay connection
async function testConnection() {
  try {
    console.log('🔍 Testing Razorpay Connection...');

    // Try to fetch a single order to test connection
    const orders = await razorpay.orders.all({
      count: 1
    });

    console.log('✅ Razorpay connection successful!');
    console.log('Found', orders.count, 'orders');

    return true;
  } catch (error) {
    console.error('❌ Razorpay connection failed:');
    console.error('Error:', error.message);

    return false;
  }
}

// Test 3: Check account details
async function testAccountDetails() {
  try {
    console.log('📋 Testing Razorpay Account Details...');

    // This tests if we can access basic Razorpay functionality
    const payments = await razorpay.payments.all({
      count: 1
    });

    console.log('✅ Account access successful!');
    console.log('Found', payments.count, 'payments');

    return true;
  } catch (error) {
    console.error('❌ Account access failed:');
    console.error('Error:', error.message);

    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Razorpay API Tests\n');

  const tests = [
    { name: 'Connection Test', fn: testConnection },
    { name: 'Account Details Test', fn: testAccountDetails },
    { name: 'Order Creation Test', fn: testOrderCreation }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();

    if (result) {
      passed++;
      console.log(`✅ ${test.name}: PASSED`);
    } else {
      failed++;
      console.log(`❌ ${test.name}: FAILED`);
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (passed === tests.length) {
    console.log('\n🎉 All tests passed! Razorpay integration is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check your Razorpay credentials.');
  }
}

// Run the tests
runAllTests().catch(console.error);