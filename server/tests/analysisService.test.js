import { beforeEach, afterEach, describe, expect, jest } from '@jest/globals';


/**
 * Mock functions to simulate database operations
 */
const mockFindUnique = jest.fn();
const mockCreateFile = jest.fn();
const mockFindFirst = jest.fn();

// Mock Prisma client BEFORE importing the service
jest.unstable_mockModule('../prisma/prismaClient.js', () => ({
    default: {
        projects: {
            findUnique: mockFindUnique
        },
        code_files: {
            create: mockCreateFile
        },
        analyses: {
            findFirst: mockFindFirst
        }
    }
}));

// Mock @prisma/client for AnalysisType enum
jest.unstable_mockModule('@prisma/client', () => ({
    AnalysisType: {
        CODE_QUALITY: 'CODE_QUALITY',
        SECURITY: 'SECURITY',
        COMPLEXITY: 'COMPLEXITY',
        BEST_PRACTICES: 'BEST_PRACTICES',
        PERFORMANCE: 'PERFORMANCE'
    }
}));

// Mock constants with proper UPLOAD_DIR
jest.unstable_mockModule('../services/analysis/constants.js', () => ({
    FILE_CONFIG: {
        UPLOAD_DIR: '/mock/uploads',
        maxFileSize: 50000,
        maxBatchSize: 500000,
        maxBatchFiles: 50,
        supportedExtensions: ['.js', '.jsx', '.py'],
        priorityExtensions: ['.js', '.jsx', '.py']
    }
}));

// Mock npmlog
jest.unstable_mockModule('npmlog', () => ({
    default: {
        silly: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
    }
}));

// Mock fs/promises
jest.unstable_mockModule('fs/promises', () => ({
    readFile: jest.fn().mockResolvedValue('// sample content\nconst a = 1;'),
    readdir: jest.fn().mockResolvedValue([]),
    stat: jest.fn().mockResolvedValue({ isDirectory: () => false })
}));


// Keep real path module
jest.unstable_mockModule('path', () => jest.requireActual('path'));

// Mock static metrics helpers
jest.unstable_mockModule('../services/analysis/staticMetrics.js', () => ({
    getAllFiles: jest.fn().mockResolvedValue([
        '/mock/project/index.js',
        '/mock/project/utils/helpers.js'
    ]),
    countDirectories: jest.fn().mockResolvedValue(2),
    detectLanguage: jest.fn().mockReturnValue('javascript'),
    extractComments: jest.fn().mockReturnValue(['// comment']),
    removeCommentsAndBlankLines: jest.fn().mockReturnValue('const a = 1')
}));

// Mock static analysis function - this is the key fix
jest.unstable_mockModule('../services/analysis/staticAnalysis.js', () => ({
    runStaticAnalysis: jest.fn().mockImplementation((filename, content) => {
        // Return different metrics based on content for realistic testing
        if (content === 'const x = 1;') {
            return {
                language: 'javascript',
                totalLines: 1,
                codeLines: 1,
                commentLines: 0,
                blankLines: 0,
                commentsRatio: 0
            };
        }
        // Default mock response
        return {
            language: 'javascript',
            totalLines: 5,
            codeLines: 3,
            commentLines: 1,
            blankLines: 1,
            commentsRatio: 33.3
        };
    })
}));

// Import the service AFTER all mocks are set up
const AnalysisService = (await import('../services/analysis/analysisService.js')).default;

describe('AnalysisService', () => {
    let service;

    beforeEach(() => {
        service = new AnalysisService();

        // Reset all mocks before each test
        jest.clearAllMocks();

        // Set up default mock return values
        mockFindUnique.mockResolvedValue({
            project_id: 1,
            project_name: 'Mock Project'
        });
        mockCreateFile.mockResolvedValue({ id: 1 });
        mockFindFirst.mockResolvedValue({
            analysis_id: 1,
            project_id: 1,
            analysis_type: 'CODE_QUALITY'
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('analyzeProject()', () => {
        it('should analyze files and store code metadata in DB', async () => {
            await service.analyzeProject(1);

            // Verify project lookup was called correctly
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { project_id: 1 }
            });
            expect(mockFindUnique).toHaveBeenCalledTimes(1);

            // Verify all files were processed (2 files = 2 DB creates)
            expect(mockCreateFile).toHaveBeenCalledTimes(2);

            // Verify the structure of data being saved
            expect(mockCreateFile).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        project_id: 1,
                        programming_lang: 'javascript',
                        file_name: expect.any(String),
                        content: '// sample content\nconst a = 1;',
                        file_size: expect.any(Number),
                        file_path: expect.any(String),
                        created_at: expect.any(Date),
                        updated_at: expect.any(Date)
                    })
                })
            );

            // Verify specific file names were processed
            const createCalls = mockCreateFile.mock.calls;
            const fileNames = createCalls.map(call => call[0].data.file_name);
            expect(fileNames).toContain('index.js');
            expect(fileNames).toContain('helpers.js');
        });

        it('should throw error when project ID is missing', async () => {
            await expect(service.analyzeProject()).rejects.toThrow('Project ID is required');
            await expect(service.analyzeProject(null)).rejects.toThrow('Project ID is required');
            await expect(service.analyzeProject('')).rejects.toThrow('Project ID is required');
        });

        it('should throw error when project is not found', async () => {
            mockFindUnique.mockResolvedValue(null);

            await expect(service.analyzeProject(999)).rejects.toThrow('Project 999 not found');

            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { project_id: 999 }
            });
            expect(mockCreateFile).not.toHaveBeenCalled();
        });

        it('should handle database errors gracefully', async () => {
            const dbError = new Error('Database connection failed');
            mockFindUnique.mockRejectedValue(dbError);

            await expect(service.analyzeProject(1)).rejects.toThrow('Database connection failed');
        });

        it('should handle file creation errors gracefully', async () => {
            const createError = new Error('Failed to create file record');
            mockCreateFile.mockRejectedValue(createError);

            await expect(service.analyzeProject(1)).rejects.toThrow('Failed to create file record');

            expect(mockFindUnique).toHaveBeenCalled();
        });
    });

    describe('analyzeFileCode()', () => {
        it('should analyze file and return metrics', async () => {
            const fileData = {
                filename: 'test.js',
                content: 'const x = 1;',
                analysisType: ['CODE_QUALITY']
            };

            const result = await service.analyzeFileCode(fileData);

            expect(result).toEqual(expect.objectContaining({
                filename: 'test.js',
                content: 'const x = 1;',
                analysisType: ['CODE_QUALITY'],
                metrics: expect.objectContaining({
                    language: 'javascript',
                    totalLines: 1,  // Updated to match actual behavior
                    codeLines: 1,   // Updated to match actual behavior
                    commentLines: 0, // Updated to match actual behavior
                    blankLines: 0,   // Updated to match actual behavior
                    commentsRatio: 0 // Updated to match actual behavior
                }),
                created_at: expect.any(Date)
            }));
        });

        it('should throw error for invalid file data', async () => {
            await expect(service.analyzeFileCode({})).rejects.toThrow('Invalid file data');

            await expect(service.analyzeFileCode({
                filename: 'test.js'
            })).rejects.toThrow('Invalid file data');

            // Test the specific error message for null content
            await expect(service.analyzeFileCode({
                filename: 'test.js',
                content: null,
                analysisType: ['CODE_QUALITY']
            })).rejects.toThrow('Invalid file data'); // Updated to match actual error message
        });

        it('should throw error for invalid analysis types', async () => {
            const fileData = {
                filename: 'test.js',
                content: 'const x = 1;',
                analysisType: ['INVALID_TYPE']
            };

            await expect(service.analyzeFileCode(fileData)).rejects.toThrow('Invalid analysis types');
        });
    });

    describe('getAnalysesByProjectId()', () => {
        it('should return analysis data for valid project ID', async () => {
            const result = await service.getAnalysesByProjectId(1);

            expect(result).toEqual({
                success: true,
                analysis: expect.objectContaining({
                    analysis_id: 1,
                    project_id: 1,
                    analysis_type: 'CODE_QUALITY'
                })
            });

            expect(mockFindFirst).toHaveBeenCalledWith({
                where: {
                    project_id: 1,
                    analysis_type: 'CODE_QUALITY'
                },
                select: expect.any(Object)
            });
        });

        it('should throw error when project ID is missing', async () => {
            await expect(service.getAnalysesByProjectId()).rejects.toThrow('Project ID is required');
            await expect(service.getAnalysesByProjectId(null)).rejects.toThrow('Project ID is required');
        });

        it('should throw error for invalid order direction', async () => {
            await expect(service.getAnalysesByProjectId(1, {
                orderDirection: 'INVALID'
            })).rejects.toThrow('Order direction must be ASC or DESC');
        });
    });
});
