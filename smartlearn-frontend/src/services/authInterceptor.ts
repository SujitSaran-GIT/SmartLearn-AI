// authInterceptor.ts
import { store } from '../redux/store';
import { refreshTokens, logout } from '../redux/slices/authSlice';
import { apiService } from './api';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

export const setupAuthInterceptor = () => {
  const originalFetch = window.fetch;

  window.fetch = async (input, init = {}) => {
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = input.url;
    }

    // Skip for auth endpoints and refresh token
    if (url?.includes('/auth/') || url?.includes('/refresh')) {
      return originalFetch(input, init);
    }

    let token = localStorage.getItem('accessToken');
    
    // Add authorization header if token exists
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await originalFetch(input, { 
        ...init, 
        headers 
      });
      
      // If token expired, try to refresh
      if (response.status === 401 && !url?.includes('/auth/')) {
        const originalRequest = { input, init: { ...init, headers } };

        if (isRefreshing) {
          // Queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            headers.set('Authorization', `Bearer ${newToken}`);
            return originalFetch(input, { ...init, headers });
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call refresh token endpoint
          const refreshResponse = await originalFetch(`${apiService.baseURL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error('Token refresh failed');
          }

          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.data.accessToken;

          // Store new token
          localStorage.setItem('accessToken', newAccessToken);
          
          // Update the original request with new token
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          
          // Process queued requests
          processQueue(null, newAccessToken);
          
          // Retry original request
          return originalFetch(input, { ...init, headers });
        } catch (error) {
          processQueue(error, null);
          store.dispatch(logout());
          throw error;
        } finally {
          isRefreshing = false;
        }
      }

      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };
};