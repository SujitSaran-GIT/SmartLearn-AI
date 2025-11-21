// Simple test script to verify authentication endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log();

    // Test rate limiting
    console.log('2. Testing rate limiting...');
    const startTime = Date.now();
    const promises = [];

    // Make 15 requests to test rate limiting
    for (let i = 0; i < 15; i++) {
      promises.push(
        fetch(`${BASE_URL}/auth/me`, {
          headers: {
            'Authorization': 'Bearer invalid_token'
          }
        })
      );
    }

    const results = await Promise.allSettled(promises);
    const rateLimitHit = results.some(result =>
      result.status === 'fulfilled' && result.value.status === 429
    );

    if (rateLimitHit) {
      console.log('✅ Rate limiting is working');
    } else {
      console.log('⚠️  Rate limiting may not be configured properly');
    }
    console.log();

    // Test signup
    console.log('3. Testing user signup...');
    const signupData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123'
    };

    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    });

    if (signupResponse.ok) {
      const signupResult = await signupResponse.json();
      console.log('✅ Signup successful');
      console.log('User ID:', signupResult.data.user.id);

      const { accessToken, refreshToken } = signupResult.data.tokens;
      console.log('Access token length:', accessToken.length);
      console.log('Refresh token length:', refreshToken.length);
      console.log();

      // Test protected route with valid token
      console.log('4. Testing protected route access...');
      const meResponse = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✅ Protected route access successful');
        console.log('User email:', meData.data.user.email);
        console.log();

        // Test token refresh
        console.log('5. Testing token refresh...');
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log('✅ Token refresh successful');
          console.log('New access token length:', refreshData.data.accessToken.length);
          console.log();

          // Test login
          console.log('6. Testing login...');
          const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: signupData.email,
              password: signupData.password
            })
          });

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login successful');
            console.log('Login user email:', loginData.data.user.email);
          } else {
            console.log('❌ Login failed');
          }
        } else {
          console.log('❌ Token refresh failed');
        }
      } else {
        console.log('❌ Protected route access failed');
      }
    } else {
      const signupError = await signupResponse.json();
      console.log('❌ Signup failed:', signupError.error);
    }

    console.log('\n🎉 Authentication flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on http://localhost:3000');
  }
}

// Run the test
testAuth();