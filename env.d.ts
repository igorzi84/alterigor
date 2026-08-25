declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    QUOTA_HMAC_SECRET: string;
    LLM_PROVIDERS?: string;
    RESEND_API_KEY: string;
    CONTACT_FROM_EMAIL: string;
    CONTACT_TO_EMAIL: string;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHAT_ID?: string;
  }
}
