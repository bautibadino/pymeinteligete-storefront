import type { Metadata } from "next";

import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type { TenantMetadataOptions, TenantSeoSnapshot } from "@/lib/seo/types";

function buildRobotsMetadata(indexable: boolean): NonNullable<Metadata["robots"]> {
  return {
    index: indexable,
    follow: indexable,
    googleBot: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function buildTenantMetadata(
  snapshot: TenantSeoSnapshot,
  options: TenantMetadataOptions = {},
): Metadata {
  const pathname = options.pathname ?? "/";
  const title = options.title ?? snapshot.title;
  const description = options.description ?? snapshot.description;
  const imageUrl = options.imageUrl ?? snapshot.ogImageUrl;
  const indexable = options.noIndex ? false : snapshot.indexable;
  const canonical = buildCanonicalUrl(snapshot.canonicalBaseUrl, pathname);
  const metadata: Metadata = {
    metadataBase: snapshot.canonicalBaseUrl,
    title,
    alternates: {
      canonical,
    },
    robots: buildRobotsMetadata(indexable),
    openGraph: {
      type: "website",
      url: canonical,
      title,
      siteName: snapshot.title,
      ...(description ? { description } : {}),
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      ...(description ? { description } : {}),
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };

  if (description) {
    metadata.description = description;
  }

  if (snapshot.faviconUrl) {
    metadata.icons = {
      icon: snapshot.faviconUrl,
      shortcut: snapshot.faviconUrl,
    };
  }

  return metadata;
}
