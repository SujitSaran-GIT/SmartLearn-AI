export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  error: (message, error = null) => {
    const logEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString()
    };

    if (error) {
      logEntry.error = error.message;
      logEntry.stack = error.stack;
      if (error.code) logEntry.code = error.code;
    }

    console.error(JSON.stringify(logEntry));
  },
  
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        ...meta
      }));
    }
  }
};