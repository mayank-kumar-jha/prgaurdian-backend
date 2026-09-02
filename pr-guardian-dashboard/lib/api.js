/**
 * Data Fetching Layer — PR Guardian Dashboard
 *
 * All data access goes through these functions.
 * Base URL is controlled by NEXT_PUBLIC_API_URL in .env.local.
 *
 * Timestamp normalisation: the backend uses `createdAt`; some legacy
 * documents may use `reviewedAt`. Both are handled transparently via
 * normaliseTimestamp() so components only ever see `reviewedAt`.
 */

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/** Normalise a review object so components always have `reviewedAt` */
function normaliseReview(review) {
  if (!review) return review;
  return {
    ...review,
    // Prefer createdAt (backend spec), fall back to reviewedAt (legacy)
    reviewedAt: review.reviewedAt ?? review.createdAt ?? null,
    // Flatten repoOwner/repoName into a `repo` field if not already present
    repo:
      review.repo ??
      (review.repoOwner && review.repoName
        ? `${review.repoOwner}/${review.repoName}`
        : undefined),
  };
}

/**
 * GET /api/repos
 * Returns all repos the GitHub App is installed on.
 */
export async function fetchRepos() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/repos`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`fetchRepos: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data)
      ? data.map((r) => ({
          ...r,
          id: r._id || r.id,
          active: r.active !== undefined ? r.active : true,
        }))
      : [];
  } catch (error) {
    console.error("Error fetching repos:", error);
    return [];
  }
}

/**
 * POST /api/repos/sync
 * Triggers backend sync with GitHub App accessible repositories.
 */
export async function syncRepos() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/repos/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`syncRepos failed: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('Error syncing repos:', error);
    throw error;
  }
}

/**
 * GET /api/repos/:id
 * Returns a single repo by ID.
 */
export async function fetchRepo(repoId) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/repos/${repoId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`fetchRepo: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error fetching repo:", error);
    return null;
  }
}

/**
 * GET /api/reviews
 * Returns all reviews, optionally filtered by repoId, with a limit.
 */
export async function fetchReviews({ repoId, limit } = {}) {
  try {
    const url = new URL(`${getBaseUrl()}/api/reviews`);
    if (repoId) url.searchParams.append("repoId", repoId);
    if (limit) url.searchParams.append("limit", limit);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`fetchReviews: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data.map(normaliseReview) : [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

/**
 * GET /api/reviews/:id
 * Returns a single review by ID, including comments.
 */
export async function fetchReview(reviewId) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/reviews/${reviewId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`fetchReview: ${res.status}`);
    const data = await res.json();
    return normaliseReview(data);
  } catch (error) {
    console.error("Error fetching review:", error);
    return null;
  }
}

/**
 * GET /api/stats
 * Returns aggregate statistics: totalRepos, totalReviews, accuracyPercent.
 */
export async function fetchStats() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/stats`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`fetchStats: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalRepos: 0,
      totalReviews: 0,
      approvalRate: 0,
      accuracyPercent: 0,
      avgReviewTimeMs: 0,
    };
  }
}

/**
 * GET /api/settings/:repoId
 * Returns per-repo settings.
 */
export async function fetchSettings(repoId) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/settings/${repoId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`fetchSettings: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {
      strictness: "balanced",
      autoApproveTrivial: false,
      customRules: "",
    };
  }
}

/**
 * PATCH /api/settings/:repoId
 * Saves per-repo settings. Accepts { strictness, autoApproveTrivial, customRules }.
 * Throws on failure so callers can show an error toast.
 */
export async function updateSettings(repoId, settings) {
  const res = await fetch(`${getBaseUrl()}/api/settings/${repoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "Unknown error");
    throw new Error(`Failed to save settings: ${res.status} ${msg}`);
  }
  return res.json();
}

/**
 * PATCH /api/repos/:id/active
 * Toggles monitoring on/off for a repo.
 */
export async function toggleRepoActive(repoId, active) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/repos/${repoId}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (!res.ok) throw new Error(`toggleRepoActive: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error toggling repo:", error);
    throw error;
  }
}
