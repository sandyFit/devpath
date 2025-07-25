import prisma from '../../prisma/prismaClient.js';
import { AnalysisType } from '@prisma/client';
import log from 'npmlog';
import { v4 as uuidv4 } from 'uuid';


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

    async createProjectAnalysis(analysisData) {
        try {
            this.logger.silly(`[ANALYSIS SERVICE] Creating analysis:', ${analysisData}`);
            const analysisId = uuidv4();
            const {
                fileId: file_id = uuidv4(),
                projectId: project_id,
                analysisType: analysis_type = 'CODE_QUALITY',
                filename = 'unknown_file',
                language = 'unknown',
                issuesFound: issues_found = [],
                suggestions = [],
                qualityScore: quality_score = 5,
                complexityScore: complexity_score = 5,
                securityScore: security_score = 5,
                strengths = [],
                learningRecommendations: learning_recommendations = []
            } = analysisData;

            // Validation
            if (!fileId) throw new Error('File ID is required');
            if (!project_id) throw new Error('Project ID is required');
            if (!analysis_type) throw new Error('Analysis type is required');

            const validateScore = (score, name) => {
                if (typeof score !== 'number' || score < 0 || score > 10) {
                    throw new Error(`${name} must be a number between 0 and 10`);
                }
            };

            validateScore(quality_score, 'qualityScore');
            validateScore(security_score, 'securityScore');
            validateScore(complexity_score, 'complexityScore');


            this.logger.silly(`[ANALYSIS SERVICE] Analysis created with ID: ${analysisId}`);
            const batchAnalysis = await this.prismaClient.analyses.create({
                data: {
                    file_id,
                    project_id,
                    analysis_type,
                    filename,
                    language,
                    issues_found,
                    suggestions,
                    quality_score,
                    complexity_score,
                    security_score,
                    strengths,
                    learning_recommendations,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            });
            return batchAnalysis;


        } catch (error) {
            this.logger.error(`[ANALYSIS SERVICE] Failed to create analysis: ${error.message}`);
            throw error;
        }
    }

    async analyzeFile(fileData) {
        try {
            this.logger.silly(`[ANALYSIS SERVICE] Analyzing file: ${fileData.filename}`);
            this.validateAnalysisRequest(fileData);
            this.runStaticAnalysis(fileData.content);

            const result = {
                id: uuidv4(),
                ...fileData,
                analysis_result: 'Sample analysis result',
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

    // ************ Utility functions for file anaysis *********************

    /**
     * Run static analysis on given code content
     * @param {string} fileContent 
     * @returns {Object} Metrics result
     */
    runStaticAnalysis(fileContent) {
        if (!fileContent) {
            throw new Error("file content is required");
        }

        const metrics = this.calculateBasicCodeMetrics(fileContent);
        const issues = [];

        return { metrics, issues };
    }

    calculateBasicCodeMetrics(fileContent) {
        const totalLines = fileContent.split('\n').length;
        const blankLines = fileContent.split('\n').filter(line => line.trim() === '').length;

        const codeWithoutComments = this.removeCommentsAndBlankLines(fileContent);
        const codeLines = codeWithoutComments.split('\n').filter(line => line.trim() !== '').length;

        const commentLines = this.extractComments(fileContent).length;
        const commentsRatio = codeLines > 0 ? (commentLines / codeLines) * 100 : 0;

        return {
            totalLines,
            codeLines,
            commentLines,
            blankLines,
            commentsRatio
        };
    }

    removeCommentsAndBlankLines(fileContent) {
        const lines = fileContent.split('\n');

        const codeLines = lines.filter(line => {
            const trimmed = line.trim();
            if (trimmed === '') return false; // blank
            if (trimmed.startsWith('//')) return false; // single-line comment
            if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) return false; // one-line block comment
            return true;
        });

        // Remove block comments spanning multiple lines
        let joined = codeLines.join('\n');
        joined = joined.replace(/\/\*[\s\S]*?\*\//g, '');

        return joined;
    }

    extractComments(fileContent) {
        const singleLineComments = [];
        const blockComments = [];

        const lines = fileContent.split('\n');

        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('//')) {
                singleLineComments.push(trimmed);
            }
        }

        const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
        const matches = fileContent.match(blockCommentRegex);
        if (matches) {
            blockComments.push(...matches);
        }

        return [...singleLineComments, ...blockComments];
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
