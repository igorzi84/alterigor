declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    QUOTA_HMAC_SECRET: string;
    RESEND_API_KEY: string;
    CONTACT_FROM_EMAIL: string;
    CONTACT_TO_EMAIL: string;
  }
}
