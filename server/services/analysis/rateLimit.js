import rateLimit from 'express-rate-limit';

export const analysisRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, 
    keyGenerator: (req, res) => {
        return req.user?.id || req.ip; // Fallback to IP if unauthenticated
    },
    handler: (req, res) => {
        return res.status(429).json({
            error: "Too many analysis request from this user. Please try again later."
        })
    }
   
});
