import log from 'npmlog';
import { Prisma } from '@prisma/client';

export const handleError = (res, context, error, logTag = "CONTROLLER") => {
    log.error(`[${logTag}] ${context} failed: ${error.message}`);

    if (error.message.includes("Missing required fields")) {
        return res.status(400).json({ message: error.message });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                message: "A unique constraint was violated",
                meta: error.meta,
            });
        }

        return res.status(500).json({
            message: "A database error occurred",
            code: error.code,
        });
    }

    return res.status(500).json({
        message: `An unexpected error occurred while ${context}`,
    });
};
