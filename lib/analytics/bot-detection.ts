const BOT_USER_AGENT_PATTERN =
  /bot|spider|crawl|slurp|bingpreview|facebookexternalhit|headlesschrome|googlebot|adsbot|apis-google|mediapartners-google|google-inspectiontool|googleother|storebot-google|duckduckbot|baiduspider|yandex|semrush|ahrefs|mj12bot|bytespider|petalbot|sogou|applebot|slackbot|discordbot|linkedinbot|twitterbot|whatsapp|telegrambot|pinterest/i;

function normalizeUserAgent(userAgent: string | null | undefined): string | null {
  if (typeof userAgent !== "string") {
    return null;
  }

  const normalized = userAgent.trim();
  return normalized.length > 0 ? normalized : null;
}

export function isLikelyBotUserAgent(userAgent: string | null | undefined): boolean {
  const normalizedUserAgent = normalizeUserAgent(userAgent);

  if (!normalizedUserAgent) {
    return false;
  }

  return BOT_USER_AGENT_PATTERN.test(normalizedUserAgent);
}

export function shouldFilterStorefrontTrafficEvent({
  eventName,
  userAgent,
}: {
  eventName: string | null | undefined;
  userAgent: string | null | undefined;
}): boolean {
  return eventName === "PageView" && isLikelyBotUserAgent(userAgent);
}
