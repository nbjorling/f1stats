import { log } from 'console';

const API_BASE = 'https://api.openf1.org/v1';
const RATE_LIMIT_DELAY = 400; // 350ms limit + 50ms safety buffer

type QueueItem = {
  url: string;
  options?: RequestInit;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

class OpenF1Client {
  private queue: QueueItem[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  /**
   * Fetch data from OpenF1 API with rate limiting and queuing.
   * @param endpoint The API endpoint (e.g., '/sessions?year=2024')
   * @param options Fetch options
   */
  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url =
      endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        // Enforce rate limit
        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < RATE_LIMIT_DELAY) {
          await new Promise((resolve) =>
            setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLast),
          );
        }

        // Execute request
        const response = await this.executeRequest(item.url, item.options);
        item.resolve(response);

        this.lastRequestTime = Date.now();
      } catch (error) {
        item.reject(error);
      }
    }

    this.processing = false;
  }

  public async getAccessToken(): Promise<string | null> {
    const now = Date.now();
    // buffer execution by 10s
    if (this.accessToken && now < this.tokenExpiresAt - 10000) {
      return this.accessToken;
    }

    const username = process.env.OPENF1_USERNAME;
    const password = process.env.OPENF1_PASSWORD;
    if (!username || !password) {
      return null;
    }

    try {
      console.log('[API] Authenticating...');
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const res = await fetch('https://api.openf1.org/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (res.ok) {
        const data = await res.json();
        this.accessToken = data.access_token;
        // expires_in is in seconds, convert to ms and set absolute time
        this.tokenExpiresAt = now + data.expires_in * 1000;
        console.log(
          `[API] Authenticated. Token expires in ${data.expires_in}s`,
        );
        return this.accessToken;
      } else {
        console.error(
          '[API] Authentication failed:',
          res.status,
          await res.text(),
        );
        return null;
      }
    } catch (e) {
      console.error('[API] Authentication network error:', e);
      return null;
    }
  }

  private async executeRequest(
    url: string,
    options?: RequestInit,
    retries = 3,
  ): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        // Prepare headers
        const headers = { ...options?.headers } as Record<string, string>;

        // prioritized auth:
        // 1. Try to get a fresh access token (User/Pass)
        const token = await this.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else if (process.env.OPENF1_API_KEY) {
          // Fallback to static API key if no user/pass token available
          headers['Authorization'] = `Bearer ${process.env.OPENF1_API_KEY}`;
        }

        console.log(`[API] Fetching ${url}`);
        const res = await fetch(url, {
          ...options,
          headers,
          cache: 'no-store',
        }); // Always fresh for scripts, rely on local cache for app

        if (res.ok) {
          return await res.json();
        }

        if (res.status === 401) {
          console.warn(
            `[API] 401 Unauthorized for ${url}. clearing token and retrying...`,
          );
          this.accessToken = null; // force refresh
          // The next loop iteration will call getAccessToken again.
        }

        if (res.status === 429) {
          console.warn(`[API] Rate limit hit for ${url}. Waiting longer...`);
          await new Promise((r) => setTimeout(r, 2000 * (i + 1))); // Extra wait on 429
          continue;
        }

        throw new Error(`API Error ${res.status}: ${res.statusText}`);
      } catch (e) {
        if (i === retries - 1) throw e;
        console.warn(
          `[API] Error fetching ${url}, retrying... (${i + 1}/${retries})`,
        );
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
}

// Export singleton
export const openF1Client = new OpenF1Client();
