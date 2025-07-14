import { prismaClient } from '../prisma/prismaClient.js';
import log from 'npmlog';

log.level = "silly"

/**
 * Project Repository for prisma data access
 * Handles all database operations related to projects
 */
class ProjectRepository {
    constructor() {
        this.tableName = "projects";
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
    async createProject(projectData) {
        try {
            const { userId, projectName, totalFiles = 0, status = 'PENDING' } = projectData;

            if (!userId || !projectName) {
                throw new Error("Missing required fields: userId and projectName are required");
            }
            this.logger.log(`[ProjectRepository] Creating project: ${projectId} for user: ${userId}`);

        } catch (error) {

        }
    }
}
