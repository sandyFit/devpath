import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from './prisma/prismaClient.js';
import ProjectRoutes from "./routes/projectRoutes.js";
import AnalysisRoutes from "./routes/analysisRoutes.js";

const app = express();
dotenv.config();

app.use(cors());

const projectRoutes = new ProjectRoutes();
const analysisRoutes = new AnalysisRoutes();
app.use("/api/v1/projects", projectRoutes.getRouter());
app.use("/api/v1/analyses", analysisRoutes.getRouter());

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; 
// Database connection with retry logic
const connectWithRetry = async (retries = MAX_RETRIES) => {
    try {
        await prisma.$connect();
        console.log('🔌 Database connected successfully');
        app.locals.dbConnected = true;
        return true;
    } catch (error) {
        console.error(`❌ Database connection attempt failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);

        if (retries > 1) {
            console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectWithRetry(retries - 1);
        }

        throw error;
    }
};
// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing HTTP server and database connection...');
    await prisma.$disconnect();
    process.exit(0);
});

// Update server startup
const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await connectWithRetry();

        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            console.log(`📝 Health check available at http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
