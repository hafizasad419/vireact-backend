export const ROLES = {
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
  USER: "user"
};

export const OAUTH_PROVIDERS = {
  LOCAL: "local",
  GOOGLE: "google"
};



export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// DATSBASE
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // Reduced for serverless cold starts
export const CONNECTION_TIMEOUT = 3000; // Reduced timeout for serverless





