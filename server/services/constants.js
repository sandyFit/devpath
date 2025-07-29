export const FILE_CONFIG = {
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 1024 * 1024, // 1MB
    MAX_BATCH_SIZE: process.env.MAX_BATCH_SIZE || 10, 
    MAX_BATCH_FILES: 50,
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads', 
    SUPPORTED_EXTENSIONS: ['.js', '.jsx', '.ts', '.tsx', '.py'],
    PRIORITY_EXTENSIONS: ['.js', '.jsx', '.py'],
    IGNORED_DIRECTORIES: ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'],
    IGNORED_FILES: ['.DS_Store', 'Thumbs.db', '.gitignore', '.env'],
    ANALYSIS_TIMEOUT: 30000, // 30 seconds per file
};
