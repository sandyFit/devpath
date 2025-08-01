import { AnalysisError, FileTooBigError, InvalidFileTypeError } from './analysisErrors.js';
import { AnalysisType } from '@prisma/client';
import * as path from 'path';

export const validateFilename = (filename) => {
    if (!filename?.trim()) {
        throw new AnalysisError("Filename is required and can NOT be empty", "MISSING_FILENAME");
    }
};

export const validateContent = (content, filename, logger) => {
    if (content === null || content === undefined) {
        throw new AnalysisError('File content is required', 'MISSING_CONTENT');
    }

    if (typeof content !== 'string') {
        throw new AnalysisError('File content must be a string', 'INVALID_CONTENT_TYPE');
    }

    if (content.trim() === '') {
        logger?.warn(`[ANALYSIS SERVICE] Warning: File ${filename} is empty or contains only whitespace`);
    }
};

export const validateFileExtension = (filename, supportedExtensions) => {
    const ext = path.extname(filename).toLowerCase();
    if (!supportedExtensions.includes(ext)) {
        throw new InvalidFileTypeError(filename, ext, supportedExtensions);
    }
};

export const validateFileSize = (filename, content, maxSize) => {
    const size = Buffer.byteLength(content, 'utf-8');
    if (size > maxSize) {
        throw new FileTooBigError(filename, size, maxSize);
    }
};

export const validateAnalysisType = (analysisType) => {
    const validTypes = Object.values(AnalysisType);
    if (!Array.isArray(analysisType) || analysisType.length === 0) {
        throw new AnalysisError('At least one analysis type is required', 'MISSING_ANALYSIS_TYPE');
    }

    const invalid = analysisType.filter(type => !validTypes.includes(type));
    if (invalid.length > 0) {
        throw new AnalysisError(
            `Invalid analysis types: ${invalid.join(', ')}. Supported types: ${validTypes.join(', ')}`,
            'INVALID_ANALYSIS_TYPE'
        );
    }
};
