import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import prisma from '../prisma/prismaClient.js';
import log from 'npmlog';
import { FILE_CONFIG } from '../constants.js';
import { detectLanguage } from './analysis/staticMetrics.js';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadService {
    constructor() {
        this.prismaClient = prisma;
        this.logger = log;
        this.FILE_CONFIG = FILE_CONFIG;
    }

    async extractZipContents(zipPath, projectId) {
        const zip = new AdmZip(zipPath);
        const zipEntries = zip.getEntries();

        // Create project specific extraction directory if project ID is provided
        const baseExtractedDir = path.join(__dirname, '..', 'extracted');
        const extractedDir = projectId ?
            path.join(baseExtractedDir, projectId.toString()) :
            baseExtractedDir;

        // Ensure the base extracted directory exists
        if (!fs.existsSync(baseExtractedDir)) {
            fs.mkdirSync(baseExtractedDir, { recursive: true });
        }

        // Ensure the project specific directory exists
        if (!fs.existsSync(extractedDir)) {
            fs.mkdirSync(extractedDir, { recursive: true });
        }

        let extractedFilesCount = 0;
        const extractedFiles = [];

        zipEntries.forEach((entry) => {
            if (!entry.isDirectory) {
                const extension = path.extname(entry.entryName).toLowerCase();

                // Only process supported file types
                if (this.FILE_CONFIG.SUPPORTED_EXTENSIONS.includes(extension)) {
                    const outputPath = path.join(extractedDir, path.basename(entry.entryName));
                    const content = entry.getData().toString('utf-8');

                    fs.writeFileSync(outputPath, content);
                    extractedFilesCount++;

                    // Store file metadata for analysis (only for supported files)
                    extractedFiles.push({
                        filename: path.basename(entry.entryName),
                        originalPath: entry.entryName,
                        extractedPath: outputPath,
                        extension: extension,
                        size: content.length,
                        language: detectLanguage(path.basename(entry.entryName))
                    });
                } else {
                    // Still collect metadata for unsupported files for reporting
                    extractedFiles.push({
                        filename: path.basename(entry.entryName),
                        originalPath: entry.entryName,
                        extractedPath: null, // Not extracted
                        extension: extension,
                        size: entry.header.size,
                        language: detectLanguage(path.basename(entry.entryName)),
                        supported: false
                    });
                }
            }
        });

        this.logger.silly(`[UPLOAD SERVICE] Extracted ${extractedFilesCount} files to ${extractedDir}`);

        return {
            extractedFiles,
            extractedFilesCount,
            extractedDir
        };
    }

    async getExtractedFileContent(filename, projectId = null) {
        try {
            const baseExtractedDir = path.join(__dirname, '..', 'extracted');
            const extractedDir = projectId ?
                path.join(baseExtractedDir, projectId.toString()) :
                baseExtractedDir;
            const filePath = path.join(extractedDir, filename);

            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filename}`);
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            return {
                filename,
                content,
                language: detectLanguage(filename),
                size: content.length
            };

        } catch (error) {
            this.logger.error(`[UPLOAD SERVICE] Error reading file ${filename}:`, error);
            throw error;
        }
    }

    async listExtractedFiles(projectId = null) {
        try {
            const baseExtractedDir = path.join(__dirname, '..', 'extracted');
            const extractedDir = projectId ?
                path.join(baseExtractedDir, projectId.toString()) :
                baseExtractedDir;

            if (!fs.existsSync(extractedDir)) return [];

            const files = fs.readdirSync(extractedDir);

            return files.filter((file) => {
                const extension = path.extname(file).toLowerCase();
                return this.FILE_CONFIG.SUPPORTED_EXTENSIONS.includes(extension);
            })
                .map(file => ({
                    filename: file,
                    path: path.join(extractedDir, file),
                    extension: path.extname(file).toLowerCase(),
                    language: detectLanguage(file),
                    size: fs.statSync(path.join(extractedDir, file)).size
                }));

        } catch (error) {
            this.logger.error(`[UPLOAD SERVICE] Error listing extracted files:`, error);
            throw error;
        }
    }

    /**
     * Clean up extracted files for a project
     * @param {string|number} projectId - Project ID to clean up
     */
    async cleanupExtractedFiles(projectId) {
        try {
            if (!projectId) return;

            const extractedDir = path.join(__dirname, '..', 'extracted', projectId.toString());

            if (fs.existsSync(extractedDir)) {
                fs.rmSync(extractedDir, { recursive: true, force: true });
                this.logger.silly(`[UPLOAD SERVICE] Cleaned up extracted files for project: ${projectId}`);
            }
        } catch (error) {
            this.logger.error(`[UPLOAD SERVICE] Error cleaning up extracted files:`, error);
            throw error;
        }
    }
}

export default UploadService;
