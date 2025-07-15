import AnalysisController from "../controllers/analysisController.js";
import { Router } from 'express';

class AnalysisRoutes {
    constructor() {
        this.router = Router();
        this.controller = new AnalysisController();
        this.registerRoutes();
    }

    registerRoutes() {
        this.router.post("/", (req, res) => {
            this.controller.createAnalysis(req, res);
        });

        this.router.get('/:projectId', (req, res) => {
            this.controller.getAnalysesByProjectId(req, res);
        })
    }

    getRouter() {
        return this.router;
    }
}
export default AnalysisRoutes;
