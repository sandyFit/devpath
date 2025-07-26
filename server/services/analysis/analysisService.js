import { FILE_CONFIG } from './constants.js';
import prisma from '../../prisma/prismaClient.js';
import { AnalysisType } from '@prisma/client';
import log from 'npmlog';
import * as path from 'path';
import { readFile, readdir, stat } from 'fs/promises';
import { runStaticAnalysis } from './staticAnalysis.js';
//import { detectFrameworksFromPackageJson } from './frameworkDetector.js';
import { countDirectories, getAllFiles } from "./staticMetrics.js";

class AnalysisService {
    constructor() {
        this.prismaClient = prisma;
        this.logger = log;
        this.FILE_CONFIG = FILE_CONFIG
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

        if (!filename || !content || !analysisType) {
            throw new Error('Invalid file data');
        }

        if (content === null || content === undefined || typeof content !== 'string') {
            throw new Error('File content is required and must be a string');
        }

        // Alow empty files but logging a warning
        if (content.trim() === '') {
            this.logger.warn(`[ANALYSIS SERVICE] Warning: File ${filename} is empty or contains only whitespace`);
        }

        const fileSize = Buffer.byteLength(content, 'utf-8');
        if (fileSize > this.FILE_CONFIG.maxFileSize) {
            throw new Error(
                `File ${filename} is too large (${fileSize} bytes). 
                Maximum allowed: ${this.FILE_CONFIG.maxFileSize} bytes`
            );
        }
        // ✅ Validate that analysisType is an array of valid enum values
        const validEnumValues = Object.values(AnalysisType); // gets all enum values from Prisma schema.
        if (!analysisType || !Array.isArray(analysisType) || analysisType.length === 0) {
            throw new Error('At least one analysis type is required');
        }

        const invalidTypes = analysisType.filter(type => !validEnumValues.includes(type));
        if (invalidTypes.length > 0) {
            throw new Error(`
                Invalid analysis types: ${invalidTypes.join(', ')}. 
                Supported types: ${validEnumValues.join(', ')}`
            );
        }
        
    }

    async analyzeProject(projectId) {
        try {
            this.logger.silly(`[ANALYSIS SERVICE] Analyzing project: ${projectId}`);
            if (!projectId) {
                throw new Error('Project ID is required');
            }

            // 1. Get project from DB
            const project = await this.prismaClient.projects.findUnique({
                where: { project_id: projectId }               
            })

            if (!project) throw new Error(`Project ${projectId} not found`);

            const projectDirPath = path.join(this.FILE_CONFIG.UPLOAD_DIR, `project_${projectId}`);
            const allFiles = await getAllFiles(projectDirPath);
            const directoriesCount = await countDirectories(projectDirPath);

            let languageMap = {};
            let totalLines = 0;
            let totalFiles = 0;

            for (const filePath of allFiles) {
                const content = await readFile(filePath, 'utf8');
                const metrics = runStaticAnalysis(filePath, content);

                totalFiles++;
                totalLines += metrics.totalLines;
                languageMap[metrics.language] = (languageMap[metrics.language] || 0) + 1;

                await this.prismaClient.code_files.create({
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
            }
            return {
                success: true,
                projectId,
                totalFiles,
                totalLines,
                directoriesCount,
                languageMap
            };

        } catch (error) {
            this.logger.error(`[ANALYSIS SERVICE] analyzeProject failed: ${error.message}`);
            throw error;
        }
    }
    
    async getAnalysesByProjectId(projectId, options = {}) {
        try {
            this.logger.silly(`[ANALYSIS SERVICE] Getting analysis for ${projectId}`);
            if (!projectId) {
                throw new Error('Project ID is required');
            }
            const {
                limit = 50,
                offset = 0,
                orderBy = 'CREATED_AT',
                orderDirection = 'DESC',
                minQualityScore,
                maxComplexityScore
            } = options;

            this.logger.silly(`
                [ANALYSIS SERVICE] Parsed options -
                limit: ${limit}, offset: ${offset}, orderBy: ${orderBy}`);

            // Validate orderDirection
            if (!['ASC', 'DESC'].includes(orderDirection.toUpperCase())) {
                throw new Error('Order direction must be ASC or DESC');
            }

            this.logger.silly(`[ANALYSIS SERVICE] Validation passed, 
                proceeding to retrieve analyses for project: ${projectId}`);

            // DEBUG: Test if any issue 
            console.log('[DEBUG] Looking for project ID:', projectId);
            console.log('[DEBUG] Project ID type:', typeof projectId);

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
