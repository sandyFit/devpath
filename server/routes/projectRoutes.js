import ProjectController from "../controllers/projectController.js";
import { Router } from "express";

class ProjectRoutes {
    constructor() {
        this.router = Router();
        this.controller = new ProjectController();
        this.registerRoutes(); 
    }

    registerRoutes() {
        this.router.post("/", (req, res) => {
            this.controller.createProject(req, res);
        });

        this.router.get("/:projectId", (req, res) => {
            this.controller.getProjectById(req, res);
        });

        this.router.get("/:projectId/summary", (req, res) => {
            this.controller.getProjectSummary(req, res);
        });

        this.router.get("/:projectId/stats", (req, res) => {
            this.controller.getProjectStats(req, res);
        });

        this.router.get("/test", (req, res) => {
            res.send("Project test OK");
        });

    }

    getRouter() {
        return this.router;
    }
}
export default ProjectRoutes;
