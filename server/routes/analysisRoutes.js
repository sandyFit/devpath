import AnalysisController from "../controllers/analysisController.js";
import { Router } from 'express';
import { userRateLimit } from "../services/analysis/rateLimit.js"; 


class AnalysisRoutes {
    constructor() {
        this.router = Router();
        this.controller = new AnalysisController();
        this.registerRoutes();
    }

    registerRoutes() {
        this.router.post("/", userRateLimit, (req, res) => {
            this.controller.createAnalysis(req, res);
        });

        this.router.post('/:projectId/file', userRateLimit, (req, res) => {
            this.controller.analyzeFileCode(req, res);
        });

        this.router.post('/:projectId', userRateLimit, (req, res) => {
            this.controller.analyzeProject(req, res);
        });

        this.router.get('/:projectId', (req, res) => {
            this.controller.getAnalysesByProjectId(req, res);
        });
    }

    getRouter() {
        return this.router;
    }
}
export default AnalysisRoutes;
