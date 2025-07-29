import AnalysisService from "../services/analysis/analysisService.js";
import log from 'npmlog';
import { handleError } from "../utils/handleError.js";

class AnalysisController { 
    constructor() {
        this.service = new AnalysisService();
        this.logger = log;
    }

    async createAnalysis(req, res) {
        try {
            const { analysisData } = req.body;
            this.logger.silly('[ANALYSIS CONTROLLER] Creating analysis:', analysisData);
            if (!analysisData || !analysisData.projectId) {
                return res.status(400).json({ error: 'Missing required analysis data.' });
            }

            const analysis = await this.service.createAnalysis(analysisData);
            this.logger.silly('[ANALYSIS CONTROLLER] Analysis created:', analysis);
            return res.status(201).json(analysis);

        } catch (error) {
            this.logger.error("[ERROR] createAnalysis failed:", error);
            return handleError(res, "creating analysis", error, "ANALYSIS CONTROLLER");
        }

    }

    async analyzeFileCode(req, res) {
        try {
            const { fileData } = req.body;
            this.logger.silly(`[ANALYSIS CONTROLLER] Analyzing file:, ${fileData.filename}`);
            if (!fileData || !fileData.filename) {
                return res.status(400).json({
                    error: 'Missing required analysis data.'
                });
            }

            const fileAnalysis = await this.service.analyzeFileCode(fileData);
            this.logger.silly(`[ANALYSIS CONTROLLER] File analysis created: ${fileAnalysis}`);
            return res.status(201).json(fileAnalysis);

        } catch (error) {
            this.logger.error(`[ERROR] analizeFileCode failed:, ${error}`);
            return handleError(res, "analyzing file", error, "ANALYSIS CONTROLLER");
        }
    }


    async analyzeProject(req, res) {
        try {
            const projectId = req.params.projectId;
            if (!projectId) {
                return res.status(400).json({ error: 'Missing required project ID.' });
            }

            this.logger.silly(`[ANALYSIS CONTROLLER] Getting analyses for project ${projectId}`);
            const analysis = await this.service.analyzeProject(projectId);

            this.logger.info("[ANALYSIS CONTROLLER] Analysis retrieved:", analysis);
            return res.status(200).json(analysis);            

        } catch (error) {
            this.logger.error("[ERROR] analyzeProject failed:", error);
            return handleError(res, "Analyzing project", error, "ANALYSIS CONTROLLER");
        }
    }

    async getAnalysesByProjectId(req, res) {
        try {
            const projectId = req.params.projectId;
            if (!projectId) { 
                return res.status(400).json({ error: 'Missing required project ID.' });
            }
            this.logger.silly(`[ANALYSIS CONTROLLER] Getting analyses for project ${projectId}`);
            const analysis = await this.service.getAnalysesByProjectId(projectId);

            this.logger.info("[ANALYSIS CONTROLLER] Analysis retrieved:", analysis);
            return res.status(200).json(analysis);
        } catch (error) {
            this.logger.error("[ERROR] getAnalysesByProjectId failed:", error);
            return handleError(res, "retrieving analysis", error, "ANALYSIS CONTROLLER");
        }
    }
}
export default AnalysisController;
