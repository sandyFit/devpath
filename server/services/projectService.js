import prisma from '../prisma/prismaClient.js';
import log from 'npmlog';

class ProjectService {
    constructor() {
        this.prismaClient = prisma;
        this.logger = log;
    }

    /**
     * Create a new project in the database
     * @param {Object} projectData - Project data
     * @param {string} projectData.userId - User ID who owns the project
     * @param {string} projectData.projectName - Name of the project
     * @param {number} [projectData.totalFiles=0] - Total number of files in the project
     * @param {string} [projectData.status='PENDING'] - Initial status of the project
     * @returns {Promise<Object>} Created project data with generated ID
     */
    async createProject(project) {
        try {
            const {
                userId: user_id,
                projectName: project_name,
                totalFiles: total_files = 0,
                status: status_code = 'PENDING'
            } = project;

            if (!user_id || !project_name) {
                throw new Error('Missing required fields: userId and projectName are required');
            }

            this.logger.silly(`[PROJECT SERVICE] Creating project: ${project_name} for user: ${user_id}`);

            const result = await this.prismaClient.projects.create({
                data: {
                    user_id,
                    project_name,
                    total_files,
                    status_code,
                    uploaded_at: new Date(),
                    updated_at: new Date(),
                }
            });

            this.logger.info(`[PROJECT SERVICE] Project created successfully: ${result.project_id}`);
            return result;

        } catch (error) {
            this.logger.error(`[PROJECT SERVICE] Failed to create project: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get a project by its ID
     * @param {string|number} projectId - Project ID to retrieve
     * @returns {Promise<Object|null>} Project data or null if not found
     */
    async getProjectById(projectId) {
        try {
            const exists = await this.projectExists(projectId);
            if (!exists) {
                throw new Error(`Project with ID ${projectId} does not exist`);
            }

            this.logger.silly(`[PROJECT SERVICE] Retrieving project: ${projectId}`);

            const project = await this.prismaClient.projects.findUnique({
                where: { project_id: Number(projectId) },
                include: {
                    users: true,
                    code_files: true,
                    analyses: true,
                    learning_paths: true,
                    project_statistics: true,
                    project_statuses: true,
                }
            });

            return project;

        } catch (error) {
            this.logger.error(`[PROJECT SERVICE] Failed to fetch project: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get summary statistics for a project by its ID
     * @param {number|string} projectId - Project ID to retrieve statistics for
     * @returns {Promise<Object|null>} Statistics object or null if none found
     */
    async getProjectSummary(projectId) {
        try {
            const exists = await this.projectExists(projectId);
            if (!exists) {
                throw new Error(`Project with ID ${projectId} does not exist`);
            }

            this.logger.silly(`[PROJECT SERVICE] Retrieving project summary: ${projectId}`);

            // Workaround for Postgres "cached plan must not change result type" error in Neon Serverless
            // Step 1: Get all *safe* scalar fields first
            const baseSummary = await this.prismaClient.project_statistics.findFirst({
                where: { project_id: Number(projectId) },
                orderBy: { created_at: "desc" },
                select: {
                    average_quality_score: true,
                    average_complexity_score: true,
                    average_security_score: true,
                    total_files: true,
                    total_tests: true,
                    total_issues: true,
                    total_lines_of_code: true,
                    total_functions: true,
                    total_classes: true,
                },
            });

            if (!baseSummary) {
                this.logger.warn(`[PROJECT SERVICE] Project summary not found: ${projectId}`);
                return null;
            }

            // Step 2: Fetch the JSON field separately
            // Splitting query ensures separate execution plans for Json fields
            const jsonField = await this.prismaClient.project_statistics.findFirst({
                where: { project_id: Number(projectId) },
                orderBy: { created_at: "desc" },
                select: {
                    language_distribution: true,
                },
            });

            // Step 3: Merge results
            const summary = {
                ...baseSummary,
                language_distribution: jsonField?.language_distribution || {},
            };

            this.logger.info(`[PROJECT SERVICE] Project summary retrieved successfully: ${projectId}`);
            return summary;

        } catch (error) {
            this.logger.error(`[PROJECT SERVICE] Failed to get summary: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get project statistics over time
     * @param {number|string} projectId - Project ID to retrieve statistics for
     * @returns {Promise<Array>} Array of statistics ordered by creation date
     */
    async getProjectStats(projectId) {
        try {
            const exists = await this.projectExists(projectId);
            if (!exists) {
                throw new Error(`Project with ID ${projectId} does not exist`);
            }

            this.logger.silly(`[PROJECT SERVICE] Retrieving project stats: ${projectId}`);

            const stats = await this.prismaClient.project_statistics.findMany({
                where: { project_id: Number(projectId) },
                orderBy: { created_at: 'asc' }, // oldest first
                select: {
                    created_at: true,
                    average_quality_score: true,
                    average_complexity_score: true,
                    average_security_score: true,
                }
            });

            return stats;

        } catch (error) {
            this.logger.error(`[PROJECT SERVICE] Failed to get stats: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update project status
     * @param {number|string} projectId - Project ID to update
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated project data
     */
    async updateProjectStatus(projectId, status) {
        try {
            const exists = await this.projectExists(projectId);
            if (!exists) {
                throw new Error(`Project with ID ${projectId} does not exist`);
            }

            this.logger.silly(`[PROJECT SERVICE] Updating project status: ${projectId} to ${status}`);

            const result = await this.prismaClient.projects.update({
                where: { project_id: Number(projectId) },
                data: {
                    status_code: status,
                    updated_at: new Date(),
                }
            });

            return result;

        } catch (error) {
            this.logger.error(`[PROJECT SERVICE] Failed to update project status: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get all projects for a user
     * @param {string} userId - User ID to get projects for
     * @param {Object} options - Query options
     * @param {number} [options.limit=10] - Number of projects to return
     * @param {number} [options.offset=0] - Number of projects to skip
     * @param {string} [options.orderBy='updated_at'] - Field to order by
     * @param {string} [options.orderDirection='desc'] - Order direction
     * @returns {Promise<Array>} Array of projects
     */
    async getUserProjects(userId, options = {}) {
        try {
            const {
                limit = 10,
                offset = 0,
                orderBy = 'updated_at',
                orderDirection = 'desc'
            } = options;

            this.logger.silly(`[PROJECT SERVICE] Retrieving projects for user: ${userId}`);

            const projects = await this.prismaClient.projects.findMany({
                where: { user_id: userId },
                include: {
                    project_statistics: {
                        orderBy: { created_at: 'desc' },
                        take: 1 // Get latest statistics
                    }
                },
                orderBy: { [orderBy]: orderDirection },
                take: limit,
                skip: offset
            });

            return projects;

        } catch (error) {
            this.logger.error(`[PROJECT SERVICE] Failed to get user projects: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check if a project exists
     * @param {string|number} projectId - Project ID to check
     * @returns {Promise<boolean>} True if project exists, false otherwise
     */
    async projectExists(projectId) {
        try {
            if (!projectId) return false;

            const result = await this.prismaClient.projects.findUnique({
                where: {
                    project_id: Number(projectId)
                }
            });

            return !!result;

        } catch (error) {
            this.logger.error(`[PROJECT SERVICE] Error checking project existence: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete a project and all associated data
     * @param {string|number} projectId - Project ID to delete
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async deleteProject(projectId) {
        try {
            const exists = await this.projectExists(projectId);
            if (!exists) {
                throw new Error(`Project with ID ${projectId} does not exist`);
            }

            this.logger.silly(`[PROJECT SERVICE] Deleting project: ${projectId}`);

            // Note: Prisma will handle cascading deletes based on your schema relationships
            await this.prismaClient.projects.delete({
                where: { project_id: Number(projectId) }
            });

            this.logger.info(`[PROJECT SERVICE] Project deleted successfully: ${projectId}`);
            return true;

        } catch (error) {
            this.logger.error(`[PROJECT SERVICE] Failed to delete project: ${error.message}`);
            throw error;
        }
    }
}

export default ProjectService;
