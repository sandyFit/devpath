import { expect, jest } from '@jest/globals';  // ✅ fixes "jest is not defined"

/**
 * jest.unstable_mockModule() is the correct way to mock modules when using 
 * ES Modules (import/export) in Jest.
 * This is the ESM-friendly alternative to jest.mock() (which only works with CommonJS modules).
 * These jest.fn() functions are test doubles — you control their return values and check how 
 * they were called.
 */
const mockCreate = jest.fn();
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockFindMany = jest.fn();

jest.unstable_mockModule('../prisma/prismaClient.js', () => ({
    default: {
        projects: {
            create: mockCreate,
            findUnique: mockFindUnique,
        },
        project_statistics: {
            findFirst: mockFindFirst,
            findMany: mockFindMany,
        }
    }
}));

jest.unstable_mockModule('npmlog', () => ({
    default: {
        silly: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    }
}));

const { default: ProjectService } = await import('../services/projectService.js');

describe('ProjectService', () => {
    let service;

    beforeEach(() => {
        service = new ProjectService();
    });

    // 🧪 createProject

    it('should create a project with valid input', async () => {
        const mockProject = {
            userId: 'abc123',
            projectName: 'My Test Project',
        };

        const expectedResult = {
            project_id: 1,
            ...mockProject,
            total_files: 0,
            status_code: 'PENDING',
            uploaded_at: new Date(),
            updated_at: new Date(),
        };

        mockCreate.mockResolvedValue(expectedResult);

        const result = await service.createProject(mockProject);

        expect(mockCreate).toHaveBeenCalled();
        expect(result.userId).toBe('abc123');
    });

    it('should throw an error if userId is missing', async () => {
        const badInput = { projectName: 'Bad Project' };

        await expect(service.createProject(badInput)).rejects.toThrow(
            'Missing required fields: userId and projectName are required'
        );
    });

    // 🧪 getProjectById

    it('should return project if it exists', async () => {
        // ✅ override the instance's projectExists method to always return true
        service.projectExists = jest.fn().mockResolvedValue(true);

        const fakeProject = {
            project_id: 1,
            project_name: 'Demo',
            user_id: 'user1',
            users: {},
            code_files: [],
            analyses: [],
            learning_paths: [],
            project_statistics: [],
            project_statuses: [],
        };

        mockFindUnique.mockResolvedValue(fakeProject);

        const result = await service.getProjectById(1);

        expect(service.projectExists).toHaveBeenCalledWith(1);
        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { project_id: 1 },
            include: expect.any(Object),
        });

        expect(result).toEqual(fakeProject);
    });

    it('should throw error if project does not exist', async () => {
        service.projectExists = jest.fn().mockResolvedValue(false);

        await expect(service.getProjectById(1)).rejects.toThrow(
            'Project with ID 1 does not exist'
        );
    });

    // 🧪 getProjectSummary

    it('should return project summary', async () => {
        service.projectExists = jest.fn().mockResolvedValue(true);

        const fakeProjectSummary = {
            project_id: 1,
            average_quality_score: 0,
            average_complexity_score: 0,
            average_security_score: 0,
            cyclomatic_complexity: 0,
            language_distribution: {},
            total_files: 0,
            total_dirs: 0,
            total_tests: 0,
            total_issues: 0,
            total_lines_of_code: 0,
            total_functions: 0,
            total_classes: 0,
        };

        mockFindFirst.mockResolvedValue(fakeProjectSummary);

        const result = await service.getProjectSummary(1);

        expect(service.projectExists).toHaveBeenCalledWith(1);
        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { project_id: 1 },
            include: expect.any(Object),
        });

        expect(result).toEqual(fakeProjectSummary);
    });

    it('should return null if no project summary is found', async () => {
        service.projectExists = jest.fn().mockResolvedValue(true);
        mockFindFirst.mockResolvedValue(null);

        const result = await service.getProjectSummary(1);
        expect(result).toBeNull();
    });

    it('should throw if fetching project summary fails', async () => {
        service.projectExists = jest.fn().mockResolvedValue(true);
        mockFindFirst.mockRejectedValue(new Error('Summary failure'));
        await expect(service.getProjectSummary(1)).rejects.toThrow('Summary failure');
    });


    // 🧪 getProjectStats

    it('should return project stats', async () => {
        service.projectExists = jest.fn().mockResolvedValue(true);

        const fakeProjectStats = [{
            project_id: 0,
            average_quality_score: 0,
            average_complexity_score: 0,
            average_security_score: 0,
        }];

        mockFindMany.mockResolvedValue(fakeProjectStats);

        const result = await service.getProjectStats(1);

        expect(service.projectExists).toHaveBeenCalledWith(1);
        expect(mockFindMany).toHaveBeenCalledWith({
            where: { project_id: 1 },
            orderBy: { created_at: 'asc' },
            select: {
                created_at: true,
                average_quality_score: true,
                average_complexity_score: true,
                average_security_score: true,
            }
        });

        expect(result).toEqual(fakeProjectStats);
    });

    it('should throw if fetching project stats fails', async () => {
        service.projectExists = jest.fn().mockResolvedValue(true);
        mockFindMany.mockRejectedValue(new Error('Stats fail'));
        await expect(service.getProjectStats(1)).rejects.toThrow('Stats fail');
    });

    
});
