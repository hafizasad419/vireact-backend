import 'dotenv/config'

// Server port
export const PORT = process.env.PORT || 5000;

// Environment
export const NODE_ENV = process.env.NODE_ENV;

// Frontend & Backend URLs
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const BACKEND_URL = process.env.BACKEND_URL;

// Database Credentials
export const DB_NAME = process.env.DB_NAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_URL = process.env.DB_URL;

// Third Party API Keys
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;

// JWT Secret Key
export const JWT_SECRET = process.env.JWT_SECRET;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || JWT_SECRET;

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

// Session Secret
export const SESSION_SECRET = process.env.SESSION_SECRET || JWT_SECRET;

// Lambda check
export const IS_LAMBDA = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
