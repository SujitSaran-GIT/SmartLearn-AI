import { refreshTokens } from '../redux/slices/authSlice';

class TokenRefreshManager {
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL = 13 * 60 * 1000; // 13 minutes (refresh before 15min expiry)
  private store: any = null;

  // Set store reference to avoid circular dependency
  setStore(store: any) {
    this.store = store;
  }

  startAutoRefresh() {
    // Stop any existing refresh interval
    this.stopAutoRefresh();

    if (!this.store) {
      console.warn('Store not set in TokenRefreshManager');
      return;
    }

    const state = this.store.getState();
    const { isAuthenticated } = state.auth;

    if (isAuthenticated) {
      console.log('Starting automatic token refresh');

      // Set up interval to refresh tokens
      this.refreshInterval = setInterval(() => {
        const currentState = this.store.getState();
        if (currentState.auth.isAuthenticated) {
          console.log('Automatically refreshing tokens');
          this.store.dispatch(refreshTokens());
        } else {
          // User is no longer authenticated, stop refreshing
          this.stopAutoRefresh();
        }
      }, this.REFRESH_INTERVAL);
    }
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      console.log('Stopping automatic token refresh');
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  isTokenExpiringSoon(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const timeUntilExpiry = payload.exp * 1000 - Date.now();
      return timeUntilExpiry < 2 * 60 * 1000; // Less than 2 minutes
    } catch {
      return true; // If we can't parse the token, assume it's expiring
    }
  }

  // Manual refresh when token is expiring soon
  async refreshTokenIfExpiringSoon(): Promise<boolean> {
    if (this.isTokenExpiringSoon()) {
      if (!this.store) {
        console.warn('Store not set in TokenRefreshManager');
        return false;
      }
      try {
        await this.store.dispatch(refreshTokens()).unwrap();
        return true;
      } catch (error) {
        console.error('Failed to refresh expiring token:', error);
        return false;
      }
    }
    return true; // Token not expiring, no refresh needed
  }
}

export const tokenRefreshManager = new TokenRefreshManager();