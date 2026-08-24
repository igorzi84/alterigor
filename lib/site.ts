export const site = {
  description:
    'Platform engineering portfolio for Igor Zilberman, focused on reliable cloud systems, Kubernetes, GitOps, and Python services.',
  name: 'AlterIgor',
  title: 'Igor Zilberman | Platform Engineering Portfolio',
} as const;

const configuredSiteUrl = process.env.SITE_URL;

function getTrustedSiteUrl(value: string | undefined): URL | undefined {
  if (!value?.startsWith('https://')) {
    return undefined;
  }

  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

export const siteUrl = getTrustedSiteUrl(configuredSiteUrl);
