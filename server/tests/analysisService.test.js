import { beforeEach, describe, expect, jest } from '@jest/globals';

const mockFindFirst = jest.fn();
const mockFindUnique = jest.fn();

jest.unstable_mockModule('../prisma/prismaClient.js', () => ({
    default: {
        analyses: {
            findUnique: mockFindUnique,
            findFirst: mockFindFirst
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

const { default: AnalysisService } = await import('../services/llmAnalysis/analysisService.js');

describe('AnalysisService', () => {
    let analysis;

    beforeEach(() => {
        analysis = new AnalysisService();
    });

    // 🧪 getAnalysesByProjectId

    it('should create an analysis with valid input', async () => {
        const mockAnalysis = {
            project_id: '1',
            analysis_type: 'CODE_QUALITY'
        };

        const expectedResult = {
            analysis_result: 'Code Analysis Complete',
            issues_found: 'No major issues',
            issues_count: 0,
            suggestions: 'Add documentation',
            quality_score: 3,
            security_score: 3,
            complexity_score: 3,
            best_practices_score: 3,
            learning_gaps: 'Improve naming conventions',
            strengths: 'clear structure',
            learning_recommendations: 'asynchronous patterns',
            skill_level_assessments: 'intermediate',
            improvement_priority: 'medium',
            recommended_resources: 'the odin project',
            analysis_model: 'llama3-70b-8192',
            updated_at: new Date(),
            created_at: new Date()
        };

        mockFindUnique.mockResolvedValue(expectedResult);



    });
});
