import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryDelayOnFailover: 100,
  retryDelayOnClusterDown: 100,
  retryDelayOnTryAgain: 100,
  retryDelayOnMoved: 100
});

// Handle connection events
connection.on('connect', () => {
  console.log('✅ Connected to Redis');
});

connection.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Simple pub/sub functions instead of BullMQ
export const publishJob = async (channel, jobData) => {
  try {
    await connection.publish(channel, JSON.stringify(jobData));
    console.log(`✅ Job published to channel: ${channel}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to publish job:', error);
    return false;
  }
};

export const subscribeToChannel = (channel, callback) => {
  connection.subscribe(channel, (err, count) => {
    if (err) {
      console.error('❌ Failed to subscribe:', err);
    } else {
      console.log(`✅ Subscribed to ${channel}. Total subscriptions: ${count}`);
    }
  });

  connection.on('message', (chan, message) => {
    if (chan === channel) {
      try {
        const jobData = JSON.parse(message);
        callback(jobData);
      } catch (error) {
        console.error('❌ Failed to parse message:', error);
      }
    }
  });
};

export { connection };