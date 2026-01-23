const isProduction = process.env.NODE_ENV === "production";

// Cookies must be accepted in both environments:
// - Dev (http://localhost): secure=false, sameSite=Lax
// - Prod (https + cross-site): secure=true, sameSite=None
export const cookieSameSite = process.env.COOKIE_SAMESITE
  ?? (isProduction ? "None" : "Lax");
export const cookieSecure = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === "true"
  : isProduction;

export const ACCESS_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const cookieOpts = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: cookieSameSite,
  path: "/",
};
