import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { cloudinary } from './config/cloudinary.config';

// import connectDB from './config/db.config'; // Removed Mongoose connection
import firebaseApp from './config/firebase.config';

import authRoutes from './routes/auth.routes';
import couponRoutes from './routes/coupon.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import productRoutes from './routes/product.route';
import statsRoutes from './routes/stats.route';
import chatRoutes from './routes/chat.routes';

import { apiErrorMiddleware } from './utils/ApiError';
import winston from 'winston';

firebaseApp.firestore();

const app: Application = express();

const PORT = Number(process.env.PORT) || 8080;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// connectDB(); // Removed Mongoose connection

// Apply middlewares
app.use(cors({ credentials: true, origin: CLIENT_URL }));
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(compression());
// app.use(mongoSanitize()); // Removed mongoSanitize

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Health check endpoint for Cloud Run
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'API is running 🚀',
        environment: process.env.NODE_ENV,
        port: PORT
    });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/chat', chatRoutes);

// Serve static files (should be placed after API routes)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });
} else if (process.env.NODE_ENV === 'development') {
    app.get('/', (req: Request, res: Response) => {
        res.send('API is running... 🚀 [Development Mode]');
    });
}

// Error handling middleware
// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    winston.error(err.message, err);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
    });
});

// app.use(apiErrorMiddleware);

// Start server
console.log('🚀 Starting server...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${PORT}`);
console.log(`🔗 Client URL: ${CLIENT_URL}`);

// CRITICAL: Bind to 0.0.0.0 to accept connections from Cloud Run
// Cloud Run requires binding to all network interfaces, not just localhost
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
    console.log(`✅ Server is ready to accept connections`);
    console.log(`🏥 Health check available at: /health`);
});

// Handle server errors
server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
