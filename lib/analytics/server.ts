import { cookies } from "next/headers";

import { readAnalyticsIdentityFromCookieString } from "@/lib/analytics/identity";

export async function readAnalyticsIdentityFromRequest() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");

  return readAnalyticsIdentityFromCookieString(cookieHeader);
}
