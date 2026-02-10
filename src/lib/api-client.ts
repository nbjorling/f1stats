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

  private async executeRequest(
    url: string,
    options?: RequestInit,
    retries = 3,
  ): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[API] Fetching ${url}`);
        const res = await fetch(url, { ...options, cache: 'no-store' }); // Always fresh for scripts, rely on local cache for app

        if (res.ok) {
          return await res.json();
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
