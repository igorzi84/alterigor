export type AppEnvironment = {
  DB?: D1Database;
  QUOTA_HMAC_SECRET?: string;
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  LLM_PROVIDERS?: string;
  ALTERIGOR_EXTENDED_PROFILE?: string;
  SITE_URL?: string;
  [key: string]: unknown;
};

export async function getEnvironment(): Promise<AppEnvironment> {
  try {
    const workers = await import('cloudflare:workers');
    return {
      ...(process.env as Record<string, unknown>),
      ...workers.env,
    } as AppEnvironment;
  } catch {
    return process.env as AppEnvironment;
  }
}

export function getNetworkAddress(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}
