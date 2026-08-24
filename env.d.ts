declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    QUOTA_HMAC_SECRET: string;
  }
}
