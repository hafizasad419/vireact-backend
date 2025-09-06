import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from './lib/passport.js';
import { ApiResponse } from './utils/ApiResponse.js';
import authRoutes from './route/auth.route.js';
import { errorHandler } from './middleware/errorHandler.js';
import { FRONTEND_URL, SESSION_SECRET } from './config/index.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:5173',
        FRONTEND_URL
    ],
    credentials: true,
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

// Session configuration
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

// Routes
app.use('/api/v1/auth', authRoutes);

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
