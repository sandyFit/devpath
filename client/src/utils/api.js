import axios from "axios";

// Create axios instance with base URL
const apiClient = axios.create({
    baseURL: 'http://localhost:4000/api/v1',
    timeout: 30000, // 30 second timeout for uploads
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Log request for debugging
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with detailed error handling
apiClient.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        // Enhanced error logging
        console.error('API Error Details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
            code: error.code,
            message: error.message,
            stack: error.stack
        });

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            switch (status) {
                case 400:
                    throw new Error(`Bad Request: ${data?.message || data?.error || 'Invalid request format'}`);
                case 413:
                    throw new Error('File too large. Please reduce file size and try again.');
                case 415:
                    throw new Error('Unsupported file type. Please upload a valid ZIP file.');
                case 422:
                    throw new Error(`Validation Error: ${data?.message || data?.error || 'Invalid file content'}`);
                case 500:
                    throw new Error('Server error. Please try again later.');
                case 503:
                    throw new Error('Service unavailable. Please try again later.');
                default:
                    throw new Error(`Upload failed: ${data?.message || data?.error || `Error ${status}`}`);
            }
        } else if (error.request) {
            // Request timeout or network error
            console.error('Request failed - no response received:', {
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
                code: error.code
            });

            if (error.code === 'ECONNABORTED') {
                throw new Error('Upload timeout. Please check your connection and try again.');
            }
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Cannot connect to server. Please ensure the server is running on port 3800.');
            }
            if (error.code === 'ENOTFOUND') {
                throw new Error('Server not found. Please check the server URL.');
            }
            throw new Error('Network error. Please check your connection and try again.');
        } else {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
);

// API service methods
const api = {
    // Enhanced connection testing
    testConnection: async () => {
        try {
            console.log('Testing server connection...');
            const response = await apiClient.get('/health');
            console.log('Server connection successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Connection test failed:', error);

            // Try to get more specific error information
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Cannot connect to server. Please ensure the server is running on port 3800.');
            }
            if (error.code === 'ENOTFOUND') {
                throw new Error('Server not found. Please check if localhost:3800 is accessible.');
            }
            if (error.code === 'ECONNABORTED') {
                throw new Error('Connection timeout. Server may be slow to respond.');
            }

            throw new Error(`Cannot connect to server: ${error.message}`);
        }
    },

    // Test upload endpoint specifically
    testUploadEndpoint: async () => {
        try {
            console.log('Testing upload endpoint...');
            const response = await apiClient.get('/upload/status');
            console.log('Upload endpoint test successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Upload endpoint test failed:', error);
            throw new Error(`Upload endpoint not accessible: ${error.message}`);
        }
    },

    getAnalysisByProjectId: async (projectId) => { 
        const response = await apiClient.get(`/analyses/${projectId}`);
        return response.data;
    },

    getProjectSummary: async (projectId) => {
        const response = await apiClient.get(`/projects/${projectId}/summary`);
        return response.data;
    }

}

export default api;
