const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const brandRoutes = require('./routes/brandRoutes');
const colorRoutes = require('./routes/colorRoutes');
const sizeRoutes = require('./routes/sizeRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/auth');
const imageRoutes = require('./routes/imageRoutes');
const errorHandler = require('./middleware/errorHandler');
const healthRoute = require('./routes/health');
const { port } = require('./config/env');

const app = express();

//connect to MongonDB
connectDB();

//Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

//rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Allow more requests in development
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: '*',  // For development only, be more specific in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600
};
app.use(cors(corsOptions));
app.options('*', cors());

// Routes
app.use('/auth', authRoutes);
app.use('/api/health', healthRoute);
app.use('/api/v1', productRoutes);
app.use('/api/v1', brandRoutes);
app.use('/api/v1', colorRoutes);
app.use('/api/v1', sizeRoutes);
app.use('/api/v1/images', imageRoutes);

// Error handling middleware
app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});