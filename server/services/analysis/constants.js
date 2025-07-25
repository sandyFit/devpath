this.FILE_CONFIG = {
    maxFileSize: 50000, // Max size of a single file in bytes (50 KB)
    maxBatchSize: 500000, // Max combined size of files in a batch
    maxBatchFiles: 50, // Max number of files allowed per batch
    supportedExtensions: ['.js', '.jsx', '.py'], // File types allowed for analysis
    priorityExtensions: ['.js', '.jsx', '.py'] // Files that get prioritized in batch jobs
};
