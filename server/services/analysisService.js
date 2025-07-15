import prisma from '../prisma/prismaClient.js';
import { AnalysisType } from '@prisma/client';
import log from 'npmlog';
import { v4 as uuidv4 } from 'uuid';

// Remove this line as it's not working
// console.log('Available enums:', prisma.AnalysisType);

class AnalysisService {
    constructor() {
        this.prismaClient = prisma;
        this.logger = log;
        this.FILE_CONFIG = {
            maxFileSize: 50000,
            maxBatchSize: 500000,
            maxBatchFiles: 50, // Increased from 20 to 50 to handle larger projects
            supportedExtensions: ['.js', '.jsx', '.py'],
            priorityExtensions: ['.js', '.jsx', '.py']
        };
    }

    async analyzeFile(fileData, priority = "High") {
        try {
            this.logger.silly(`[ANALYSIS SERVICE] Analyzing file: ${fileData.filename}`);
            this.validateAnalysisRequest(fileData);

            const result = {
                id: uuidv4(),
                ...fileData,
                analysis_result: 'Sample analysis result',
                priority,
                created_at: new Date(),
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
        // Allow empty files but log a warning
        if (content.trim() === '') {
            this.logger.warn(`[ANALYSIS SERVICE] Warning: File ${filename} is empty or contains only whitespace`);
        }

        // Validate file size
        const fileSize = Buffer.byteLength(content, 'utf8');
        if (fileSize > this.FILE_CONFIG.maxFileSize) {
            throw new Error(
                `File ${filename} is too large (${fileSize} bytes). Maximum allowed: ${this.FILE_CONFIG.maxFileSize} bytes`
            );
        }

        if (!analysisType || !Array.isArray(analysisType) || analysisType.length === 0) {
            throw new Error('At least one analysis type is required');
        }

        const validTypes = Object.values(AnalysisType);

        const invalidTypes = analysisType.filter(type => !validTypes.includes(type));

        if (invalidTypes.length > 0) {
            throw new Error(`Invalid analysis types: ${invalidTypes.join(', ')}. Supported types: ${validTypes}`);
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
