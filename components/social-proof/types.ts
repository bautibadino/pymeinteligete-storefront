export interface SocialProofAvatar {
  url: string;
  name: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  featuredCount: number;
  userAvatars?: SocialProofAvatar[];
}

export interface SocialProofReviewImage {
  originalUrl?: string;
  blobUrl?: string;
}

export interface SocialProofReviewRecord {
  reviewId: string;
  author: {
    name: string;
    photoUrl?: string;
    photoUrlBlob?: string;
  };
  rating: number;
  content?: string;
  publishedAtRaw?: string;
  images?: SocialProofReviewImage[];
  metadata?: {
    isLocalGuide?: boolean;
  };
}

export interface SocialProofReviewsResponse {
  data: SocialProofReviewRecord[];
  meta?: {
    limit: number;
    offset: number;
    total: number;
  };
}
