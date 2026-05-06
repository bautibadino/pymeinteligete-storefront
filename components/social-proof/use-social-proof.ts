"use client";

import { useEffect, useState } from "react";

import type { ReviewSummary, SocialProofReviewsResponse } from "@/components/social-proof/types";

function buildSearchParams(empresaId?: string, tenantSlug?: string) {
  const params = new URLSearchParams();

  if (empresaId) {
    params.set("empresaId", empresaId);
  }

  if (tenantSlug) {
    params.set("tenantSlug", tenantSlug);
  }

  return params;
}

function useClientFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }

    let active = true;

    fetch(url, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`social-proof-fetch-error:${response.status}`);
        }

        return (await response.json()) as T;
      })
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      })
      .catch(() => {
        if (active) {
          setData(null);
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  return { data };
}

export function useSocialProofSummary(empresaId?: string, tenantSlug?: string) {
  const params = buildSearchParams(empresaId, tenantSlug);
  const url = params.toString() ? `/api/reviews/summary?${params.toString()}` : null;

  return useClientFetch<ReviewSummary>(url);
}

export function useSocialProofReviews(
  empresaId?: string,
  tenantSlug?: string,
  options?: { limit?: number; minRating?: number; hasComment?: boolean },
) {
  const params = buildSearchParams(empresaId, tenantSlug);

  if (options?.limit) {
    params.set("limit", String(options.limit));
  }

  if (options?.minRating) {
    params.set("minRating", String(options.minRating));
  }

  if (options?.hasComment) {
    params.set("hasComment", "true");
  }

  const url = params.toString() ? `/api/reviews?${params.toString()}` : null;

  return useClientFetch<SocialProofReviewsResponse>(url);
}
