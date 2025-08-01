import UploadController from '../controllers/uploadController.js';
import { Router } from 'express';
import log from 'npmlog';

class UploadRoutes {
    constructor() {
        this.controller = new UploadController();
        this.router = Router();
        this.logger = log;
    }

    registerRoutes() {
        // Test route to verify upload endpoint is accessible      
        this.router.get('/status', (req, res) => {
            console.log('[UPLOAD STATUS] Upload status check requested');
            res.json({
                status: 'active',
                endpoint: '/api/upload',
                method: 'POST',
                contentType: 'multipart/form-data',
                fieldName: 'file',
                maxFileSize: '50MB',
                allowedTypes: ['application/zip', '.zip'],
                timestamp: new Date().toISOString()
            });
        });

        // POST /api/upload/extract
        this.router.post('/extract', (req, res) => {
            this.controller.extractZipContents(req, res);
        });

        // POST /api/v1/upload/file-content
        this.router.post('/file-content', (req, res) => {
            this.controller.getExtractedFileContent(req, res);
        });

        // GET /api/v1/upload/files/:projectId
        this.router.get('/files/:projectId', (req, res) => {
            this.controller.listExtractedFiles(req, res);
        });
    }

    getRouter() {
        return this.router;
    }
}

export default UploadRoutes;
