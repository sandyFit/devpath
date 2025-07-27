export class AnalysisError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'AnalysisError';
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class FileTooBigError extends AnalysisError {
    constructor(filename, size, maxSize) {
        super(`File ${filename} exceeds size limit`, 'FILE_TOO_BIG', {
            filename, size, maxSize
        });
    }
}

export class InvalidFileTypeError extends AnalysisError {
    constructor(filename, extension, supportedTypes) {
        super(`File type ${extension} not supported for ${filename}`, 'INVALID_FILE_TYPE', {
            filename, extension, supportedTypes
        });
    }
}

export class PathTraversalError extends AnalysisError {
    constructor(filePath) {
        super(`Path traversal detected: ${filePath}`, 'PATH_TRAVERSAL', {
            filePath
        });
    }
}
