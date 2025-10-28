import { publishJob } from "./config/redis.js";


async function testPubSub() {
  console.log('🧪 Testing Redis Pub/Sub Communication...');
  
  const testJob = {
    jobId: 'test-job-123',
    fileId: 'test-file-123',
    userId: 'test-user-123', 
    fileUrl: 'https://example.com/test.pdf',
    questionCount: 2,
    difficulty: 'easy',
    focusAreas: []
  };

  try {
    const published = await publishJob('mcq_jobs', testJob);
    if (published) {
      console.log('✅ Backend can publish jobs to Redis');
      console.log('📨 Check your AI worker console - it should receive this test job');
    } else {
      console.log('❌ Failed to publish test job');
    }
  } catch (error) {
    console.error('❌ Pub/Sub test failed:', error);
  }
}

testPubSub();