import ProjectController from "../controllers/projectController";
import { Router } from "express";
import log from 'npmlog';

class ProjectRoutes { 
    constructor() {
        this.router = Router();
        this.controller = new ProjectController();
        this.logger = log;
    }

    registerRoutes() {
        this.router.post("/", (req, res) => {
            this.controller.createProject(req, res);
        });

        this.router.get("/:projectId", (req, res) => {
            
        })
    }
}
export default ProjectRoutes;
