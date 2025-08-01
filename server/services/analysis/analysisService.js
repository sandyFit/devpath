import { FILE_CONFIG } from '../constants.js';
import prisma from '../../prisma/prismaClient.js';
import { AnalysisType } from '@prisma/client';
import log from 'npmlog';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { runStaticAnalysis } from './staticAnalysis.js';
import { countDirectories, countTests, getAllFiles, validatePath } from "./staticMetrics.js";
import { AnalysisError } from './analysisErrors.js';
import {
    validateFilename, validateContent, validateFileExtension,
    validateFileSize, validateAnalysisType
} from './validateRequests.js'

class AnalysisService {
    constructor() {
        this.prismaClient = prisma;
        this.logger = log;
        this.FILE_CONFIG = FILE_CONFIG;
    }

    async analyzeFileCode(fileData) {
        try {
            this.logger.silly(`[ANALYSIS SERVICE] Analyzing file: ${fileData.filename}`);
            this.validateAnalysisRequest(fileData);
            const metrics = runStaticAnalysis(fileData.filename, fileData.content);

            const result = {
                ...fileData,
                metrics,
                created_at: new Date()
            };
            return result;

        } catch (error) {
            this.logger.error(`[ANALYSIS SERVICE] analyzeFile failed: ${error.message}`);
            throw error;
        }
    }

    validateAnalysisRequest(fileData) {
        const { filename, content, analysisType } = fileData;

        const { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE } = this.FILE_CONFIG;

        validateFilename(filename);
        validateContent(content, filename, this.logger);
        validateFileExtension(filename, SUPPORTED_EXTENSIONS);
        validateFileSize(filename, content, MAX_FILE_SIZE);
        validateAnalysisType(analysisType);
    }


    /**
 * Processes files in batches, analyzes each, and stores them in DB.
 * @param {string[]} files - Array of file paths to process.
 * @param {string} projectId - Project ID to associate files with.
 * @param {Function} [onFileProcessed] - Callback invoked after each file.
 * @param {Function} [onProgress] - Callback to track overall progress.
 */

    async analyzeProject(projectId, onProgress = null) {
        try {
            this.logger.silly(`[ANALYSIS SERVICE] Analyzing project: ${projectId}`);

            if (!projectId) {
                throw new AnalysisError('Project ID is required', 'MISSING_PROJECT_ID');
            }

            // Get project from DB
            const project = await this.prismaClient.projects.findUnique({
                where: { project_id: projectId }
            });

            if (!project) {
                throw new AnalysisError(`Project ${projectId} not found`, 'PROJECT_NOT_FOUND');
            }

            const projectDirPath = path.join(this.FILE_CONFIG.UPLOAD_DIR, `project_${projectId}`);

            // Validate project path
            validatePath(projectDirPath, this.FILE_CONFIG.UPLOAD_DIR);

            const allFiles = await getAllFiles(projectDirPath);
            const directoriesCount = await countDirectories(projectDirPath);
            const testsCount = await countTests(allFiles);

            let languageMap = {};
            let totalLines = 0;
            let totalFiles = 0;

            // Process files in batches
            await this.processBatch(allFiles, projectId, (fileResult) => {
                totalFiles++;
                totalLines += fileResult.metrics.totalLines;
                languageMap[fileResult.metrics.language] = (languageMap[fileResult.metrics.language] || 0) + 1;
            }, onProgress);

            return {
                success: true,
                projectId,
                totalFiles,
                totalLines,
                testsCount,
                directoriesCount,
                languageMap
            };

        } catch (error) {
            this.logger.error(`[ANALYSIS SERVICE] analyzeProject failed: ${error.message}`);
            throw error;
        }
    }

    async processBatch(files, projectId, onFileProcessed, onProgress) {
        const batchSize = this.FILE_CONFIG.MAX_BATCH_SIZE;

        for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);

            await this.prismaClient.$transaction(async (tx) => {               
                await Promise.all(batch.map((filePath, batchIndex) =>
                    this._processFile(
                        tx,
                        filePath,
                        projectId,
                        onFileProcessed,
                        onProgress,
                        i + batchIndex + 1,
                        files.length
                    )
                ));

            })
        }
    }

    async _processFile(tx, filePath, projectId, onFileProcessed, onProgress, currentIndex, totalFiles) {
        try {
            const content = await readFile(filePath, 'utf-8');
            const metrics = runStaticAnalysis(filePath, content);
            await tx.code_files.create({
                data: {
                    project_id: projectId,
                    file_name: path.basename(filePath),
                    programming_lang: metrics.language,
                    content,
                    file_size: Buffer.byteLength(content),
                    file_path: filePath,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            if (onFileProcessed) onFileProcessed({ metrics });

            if (onProgress) {
                onProgress({
                    current: currentIndex,
                    total: totalFiles,
                    percentage: Math.round((currentIndex / totalFiles) * 100),
                    currentFile: path.basename(filePath),
                })
            }
        } catch (error) {
            this.logger.error(`[ANALYSIS SERVICE] 
                Failed to process file ${filePath}: ${error.message}`)
        }
    }

    async getAnalysesByProjectId(projectId, options = {}) {
        try {
            this.logger.silly(`[ANALYSIS SERVICE] Getting analysis for ${projectId}`);

            if (!projectId) {
                throw new AnalysisError('Project ID is required', 'MISSING_PROJECT_ID');
            }

            const {
                limit = 50,
                offset = 0,
                orderBy = 'CREATED_AT',
                orderDirection = 'DESC',
                minQualityScore,
                maxComplexityScore
            } = options;

            // Validate orderDirection
            if (!['ASC', 'DESC'].includes(orderDirection.toUpperCase())) {
                throw new AnalysisError('Order direction must be ASC or DESC', 'INVALID_ORDER_DIRECTION');
            }

            const analysis = await this.prismaClient.analyses.findFirst({
                where: {
                    project_id: Number(projectId),
                    analysis_type: AnalysisType.CODE_QUALITY
                },
                select: {
                    analysis_id: true,
                    project_id: true,
                    analysis_type: true,
                    file_id: true,
                    analysis_result: true,
                    issues_found: true,
                    issues_count: true,
                    suggestions: true,
                    quality_score: true,
                    security_score: true,
                    complexity_score: true,
                    best_practices_score: true,
                    learning_gaps: true,
                    strengths: true,
                    learning_recommendations: true,
                    skill_level_assessments: true,
                    improvement_priority: true,
                    recommended_resources: true,
                    analysis_model: true,
                    created_at: true,
                    updated_at: true
                }
            });

            return {
                success: true,
                analysis
            };

        } catch (error) {
            this.logger.error(`[ANALYSIS SERVICE] getAnalysesByProjectId failed: ${error.message}`);
            throw error;
        }
    }
}

export default AnalysisService;
