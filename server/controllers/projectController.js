import ProjectService from "../services/projectService.js";
import log from 'npmlog';
import { handleError } from "../utils/handleError.js";

class ProjectController {
    constructor() {
        this.service = new ProjectService();
        this.logger = log;
    }

    async createProject(req, res) {
        try {
            this.logger.silly("[PROJECT CONTROLLER] — Received request to create project");

            const { userId, projectName } = req.body;
            if (!userId || !projectName) {
                this.logger.warn("[PROJECT CONTROLLER] — Missing userId or projectName in request");
                return res.status(400).json({
                    message: "Missing required fields: userId and projectName are required",
                });
            }

            const project = await this.service.createProject(req.body);
            this.logger.info("[PROJECT CONTROLLER] — Project created successfully");
            return res.status(201).json(project);

        } catch (error) {
            return handleError(res, "creating project", error, "PROJECT CONTROLLER");
        }
    }

    async getProjectById(req, res) {
        this.logger.silly("[DEBUG] Entered getProjectById");

        try {
            const projectId = parseInt(req.params.projectId, 10);
            if (isNaN(projectId)) {
                this.logger.warn("[PROJECT CONTROLLER] — Invalid projectId format");
                return res.status(400).json({ message: "projectId must be a number" });
            }

            this.logger.silly("[DEBUG] projectId from params:", projectId);

            const project = await this.service.getProjectById(projectId);

            this.logger.info("[PROJECT CONTROLLER] — Project fetched successfully");
            return res.status(200).json(project);
            
        } catch (error) {
            this.logger.error("[ERROR] getProjectById failed:", error);
            return handleError(res, "getting project by ID", error, "PROJECT CONTROLLER");
        }
    }


    async getProjectSummary(req, res) {
        try {
            this.logger.silly("[PROJECT CONTROLLER] — Received request to get project summary");

            const projectId = parseInt(req.params.projectId, 10);
            if (isNaN(projectId)) {
                this.logger.warn("[PROJECT CONTROLLER] — Invalid projectId format");
                return res.status(400).json({ message: "projectId must be a number" });
            }

            if (!projectId) {
                this.logger.warn("[PROJECT CONTROLLER] — Missing projectId in request");
                return res.status(400).json({ message: "Missing required fields: projectId is required" });
            }

            const summary = await this.service.getProjectSummary(projectId);
            this.logger.info("[PROJECT CONTROLLER] — Project summary fetched successfully");
            return res.status(200).json(summary);

        } catch (error) {
            this.logger.error("[ERROR] getProjectSummary failed:", error);
            handleError(res, "getting project summary", error, "PROJECT CONTROLLER");
        }
    }

    async getProjectStats(req, res) {
        try {
            this.logger.silly("[PROJECT CONTROLLER] — Received request to get project statistics");

            const projectId = parseInt(req.params.projectId, 10);
            if (isNaN(projectId)) {
                this.logger.warn("[PROJECT CONTROLLER] — Invalid projectId format");
                return res.status(400).json({ message: "projectId must be a number" });
            }

            if (!projectId) {
                this.logger.warn("[PROJECT CONTROLLER] — Missing projectId in request");
                return res.status(400).json({ message: "Missing required fields: projectId is required" });
            }

            const stats = await this.service.getProjectStats(projectId);
            this.logger.info("[PROJECT CONTROLLER] — Project statistics fetched successfully");
            return res.status(200).json(stats);

        } catch (error) {
            this.logger.error("[ERROR] getProjectStats failed:", error);
            return handleError(res, "getting project statistics", error, "PROJECT CONTROLLER");
        }
    }
}

export default ProjectController;
