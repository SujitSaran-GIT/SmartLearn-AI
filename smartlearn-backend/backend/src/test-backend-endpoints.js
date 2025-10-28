import dotenv from 'dotenv';
dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const WORKER_SECRET = process.env.AI_WORKER_SECRET;

async function testBackendEndpoints() {
  console.log('🧪 Testing Backend API Endpoints...\n');

  const testJobId = 'test-job-123';

  // Test 1: Update progress endpoint
  console.log('1. Testing progress update endpoint...');
  try {
    const progressResponse = await fetch(`${BACKEND_URL}/api/mcq/jobs/${testJobId}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKER_SECRET}`
      },
      body: JSON.stringify({
        progress: 50,
        status: 'processing',
        message: 'Test progress update'
      })
    });

    const progressResult = await progressResponse.json();
    console.log(`   Status: ${progressResponse.status}`);
    console.log(`   Response:`, progressResult);
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 2: Complete job endpoint
  console.log('\n2. Testing complete job endpoint...');
  try {
    const completeResponse = await fetch(`${BACKEND_URL}/api/mcq/jobs/${testJobId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKER_SECRET}`
      },
      body: JSON.stringify({
        mcqs: [
          {
            question: "Test question?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correct_index: 0,
            explanation: "Test explanation"
          }
        ],
        total_questions: 1,
        text_length: 100
      })
    });

    const completeResult = await completeResponse.json();
    console.log(`   Status: ${completeResponse.status}`);
    console.log(`   Response:`, completeResult);
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n🎉 Backend endpoint tests completed!');
}

testBackendEndpoints();