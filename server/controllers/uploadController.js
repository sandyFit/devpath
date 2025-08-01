import UploadService from "../services/uploadService.js";
import { handleError } from "../utils/handleError.js";
import { log } from "npmlog";

class UploadController {
    constructor() {
        this.service = new UploadService();
        this.logger = log;
    };

    async extractZipContents(req, res) {
        try {
            this.logger.silly("[UPLOAD CONTROLLER] — Received request to extract zip project");
            const { zipPath, projectId } = req.body;

            if (!zipPath || !projectId) {
                this.logger.warn("[UPLOAD CONTROLLER] — Missing projectId or zipPath in request");
                return res.status(400).json({
                    message: "Missing required fields: projectId and zipPath are required",
                });
            };

            const extractedZip = await this.service.extractZipContents(req.body);
            this.logger.info("[UPLOAD CONTROLLER] — Project extracted successfully");
            return res.status(200).json(extractedZip);

        } catch (error) {
            return handleError(res, "extract project", error, "UPLOAD CONTROLLER");
        }
    };

    async getExtractedFileContent(req, res) {
        try {
            this.logger.silly("[UPLOAD CONTROLLER] — Received request to extract zip project");
            const { filename, projectId } = req.body;
            if (!filename || !projectId) {
                this.logger.warn("[UPLOAD CONTROLLER] — Missing projectId or filename in request");
                return res.status(400).json({
                    message: "Missing required fields: projectId and filename are required",
                });
            };

            const fileContent = await this.service.getExtractedFileContent(filename, projectId);
            this.logger.info("[UPLOAD CONTROLLER] — File content fetched successfully");
            return res.status(200).json(fileContent);

        } catch (error) {
            return handleError(res, "get extracted file content", error, "UPLOAD CONTROLLER");
        }
    };

    async listExtractedFiles(req, res) {
        try {
            this.logger.silly("[UPLOAD CONTROLLER] — Received request to list extracted files");
            const projectId = parseInt(req.params.projectId, 10);
            if (isNaN(projectId)) {
                this.logger.warn("[PROJECT CONTROLLER] — Invalid projectId format");
                return res.status(400).json({ message: "projectId must be a number" });
            }

            this.logger.silly("[DEBUG] projectId from params:", projectId);

            const extractedFilesList = await this.service.listExtractedFiles(projectId);
            this.logger.info("[UPLOAD CONTROLLER] — Files list fetched successfully");
            return res.status(200).json(extractedFilesList);

        } catch (error) {
            return handleError(res, "get files list", error, "UPLOAD CONTROLLER");
        }
    }
}

export default UploadController;
