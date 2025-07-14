import ProjectService from "../services/projectService";
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
            return handleError(res, "creating project", error);
        }
    }

    async getProjectById(req, res) {
        try {
            this.logger.silly("[PROJECT CONTROLLER] — Received request to fetch project");

            const { projectId } = req.params;
            if (!projectId) {
                this.logger.warn("[PROJECT CONTROLLER] — Missing projectId in request");
                return res.status(400).json({ message: "Missing required fields: projectId is required" });
            }

            const project = await this.service.getProjectById(projectId);
            this.logger.info("[PROJECT CONTROLLER] — Project fetched successfully");
            return res.status(200).json(project);

        } catch (error) {
            return handleError(res, "getting project by ID", error);
        }
    }

    async getProjectSummary(req, res) {
        try {
            this.logger.silly("[PROJECT CONTROLLER] — Received request to get project summary");

            const { projectId } = req.params;
            if (!projectId) {
                this.logger.warn("[PROJECT CONTROLLER] — Missing projectId in request");
                return res.status(400).json({ message: "Missing required fields: projectId is required" });
            }

            const summary = await this.service.getProjectSummary(projectId);
            this.logger.info("[PROJECT CONTROLLER] — Project summary fetched successfully");
            return res.status(200).json(summary);

        } catch (error) {
            return handleError(res, "getting project summary", error);
        }
    }

    async getProjectStats(req, res) {
        try {
            this.logger.silly("[PROJECT CONTROLLER] — Received request to get project statistics");

            const { projectId } = req.params;
            if (!projectId) {
                this.logger.warn("[PROJECT CONTROLLER] — Missing projectId in request");
                return res.status(400).json({ message: "Missing required fields: projectId is required" });
            }

            const stats = await this.service.getProjectStats(projectId);
            this.logger.info("[PROJECT CONTROLLER] — Project statistics fetched successfully");
            return res.status(200).json(stats);

        } catch (error) {
            return handleError(res, "getting project statistics", error);
        }
    }
}

export default ProjectController;
