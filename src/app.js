import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';


import passport from './lib/passport.js';
import { ApiResponse } from './utils/ApiResponse.js';
import { errorHandler } from './middleware/errorHandler.js';


import { FRONTEND_URL, SESSION_SECRET } from './config/index.js';
import { EarlyAccess } from './model/early-access.model.js';

// route imports
import authRoutes from './route/auth.route.js';
import earlyAccessRoutes from './route/early-access.route.js';

const app = express();

// Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: [
        "https://vireact.io",
        "https://www.vireact.io",
        "http://localhost:5173",
        "http://192.168.1.112:5173"
    ].filter(Boolean), // Remove any undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // 24 hours - cache preflight requests
}));

// Rate limiting (optional in dev)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
// app.use(limiter);

// Logging & parsers
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration (only used for OAuth handshake)
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 10 * 60 * 1000 // 10 minutes (OAuth handshake only)
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (req, res) => {
    res.
        status(200).
        json(
            ApiResponse
                .success(200, 'Health check successful', null)
        );
});

app.get('/early-access-list', async (req, res) => {
    const earlyAccessList = await EarlyAccess.find()
    res.
        status(200)
        .json(
            ApiResponse.success(200, 'Early access list', earlyAccessList)
        );
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/early-access', earlyAccessRoutes);

// 404 handler
app.use((req, res, next) => {
    res.
        status(404)
        .json(ApiResponse
            .error(404, "Route not found")
        );
});

// Centralized error handler
app.use(errorHandler);

export default app;
