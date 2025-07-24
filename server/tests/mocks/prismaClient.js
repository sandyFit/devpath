export default {
    projects: {
        create: jest.fn(),
        findUnique: jest.fn(),
    },
    project_statistics: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
    }
};
