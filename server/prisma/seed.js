import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // await prisma.users.create({
    //     data: {
    //         username: 'devpath_user',
    //         email: 'user@example.com',
    //         password_hash: 'hashed_password_123',
    //         user_status: 'active',
    //         updated_at: new Date(),
    //     },
    // });

    await prisma.users.upsert({
        where: { username: 'devpath_user' },
        update: {},
        create: {
            username: 'devpath_user',
            email: 'user@example.com',
            password_hash: 'hashed_password_123',
            user_status: 'active',
            updated_at: new Date(),
        },
    });

    const statuses = [
        { status_code: 'draft', description: 'Project created but no files uploaded yet' },
        { status_code: 'pending', description: 'Files uploaded but not yet analyzed' },
        { status_code: 'uploading', description: 'Files are being uploaded' },
        { status_code: 'analyzing', description: 'AI agents are currently analyzing code' },
        { status_code: 'analyzed', description: 'Analysis completed successfully' },
        { status_code: 'reviewing', description: 'Results under review' },
        { status_code: 'learning-path-created', description: 'A personalized learning path has been generated' },
        { status_code: 'in-progress', description: 'The user is working on the project' },
        { status_code: 'paused', description: 'The user paused their progress' },
        { status_code: 'completed', description: 'The project has been completed' },
        { status_code: 'archived', description: 'Project archived for reference' },
        { status_code: 'error', description: 'There was an issue during upload or analysis' },
        { status_code: 'cancelled', description: 'The user cancelled the project' },
    ];

    for (const status of statuses) {
        await prisma.project_statuses.upsert({
            where: { status_code: status.status_code },
            update: {},
            create: status,
        });
    }


    await prisma.projects.create({
        data: {
            user_id: 1,
            status_code: 'draft',
            project_name: 'Mock Project',
            uploaded_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(), 
        },
    });

    // 1️⃣ Add multiple code files
    const files = [
        {
            project_id: 1,
            file_name: 'index.ts',
            programming_lang: 'TypeScript',
            content: 'export const greet = () => console.log("Hello");',
            file_size: 50,
            file_path: '/files/index.ts',
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            project_id: 1,
            file_name: 'app.tsx',
            programming_lang: 'TypeScript',
            content: 'function App() { return <h1>Hello React</h1>; }',
            file_size: 100,
            file_path: '/files/app.tsx',
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            project_id: 1,
            file_name: 'test.spec.ts',
            programming_lang: 'TypeScript',
            content: 'test("greet", () => expect(true).toBe(true));',
            file_size: 40,
            file_path: '/files/test.spec.ts',
            created_at: new Date(),
            updated_at: new Date(),
        }
    ];

    for (const file of files) {
        const existing = await prisma.code_files.findUnique({
            where: {
                project_id_file_name: {
                    project_id: file.project_id,
                    file_name: file.file_name,
                },
            },
        });

        if (existing) {
            await prisma.code_files.update({
                where: {
                    project_id_file_name: {
                        project_id: file.project_id,
                        file_name: file.file_name,
                    },
                },
                data: file,
            });
        } else {
            await prisma.code_files.create({
                data: file,
            });
        }
    }


    const analysisTypes = [
        'CODE_QUALITY',
        'SECURITY',
        'COMPLEXITY',
        'BEST_PRACTICES',
        'PERFORMANCE',
    ];

    const analysisDescriptions = {
        CODE_QUALITY: 'Checks for code clarity and use of best practices.',
        SECURITY: 'Scans for vulnerabilities and insecure patterns.',
        COMPLEXITY: 'Measures cyclomatic complexity and readability.',
        BEST_PRACTICES: 'Ensures adherence to clean code and style guides.',
        PERFORMANCE: 'Detects inefficient code and possible bottlenecks.',
    };

    for (const type of analysisTypes) {
        await prisma.analyses.create({
            data: {
                project_id: 1,
                file_id: 1, // assumes code file with ID 1 exists
                analysis_type: type,
                analysis_status: 'completed',
                analyzer_version: 'llama3-70b-8192',
                confidence_level: 0.8 + Math.random() * 0.2,
                analysis_result: `✔ ${analysisDescriptions[type]}\n\n🧠 Tips: Varies based on analysis.`,
                issues_found: 'Some improvement areas detected.',
                issues_count: Math.floor(Math.random() * 4),
                suggestions: `🛠 Suggestions specific to ${type.toLowerCase()}`,
                quality_score: 80 + Math.random() * 10,
                security_score: 80 + Math.random() * 10,
                complexity_score: 75 + Math.random() * 10,
                best_practices_score: 78 + Math.random() * 10,
                learning_gaps: `Gaps found in ${type.toLowerCase()} understanding`,
                strengths: 'Consistent formatting, modular code',
                learning_recommendations: `Study ${type.toLowerCase()} techniques`,
                skill_level_assessments: 'intermediate',
                improvement_priority: 'medium',
                recommended_resources: `https://example.com/${type.toLowerCase()}`,
                analysis_model: 'llama3-70b-8192',
                processing_time_ms: 1000 + Math.floor(Math.random() * 400),
                created_at: new Date(),
                updated_at: new Date(),
            }
        });
    }


    await prisma.learning_paths.create({
        data: {
            user_id: 1,
            project_id: 1,
            recommended_topics: 'Functions, Async/Await, Scope',
            difficulty_level: 2,
            estimated_hours: 8,
            progress_percentage: 25,
            learning_status: 'in_progress',
            learning_objectives: 'Build mastery in async JavaScript patterns',
            prerequisites: 'JS basics, control flow',
            resources: 'freeCodeCamp, JavaScript.info, MDN',
            created_at: new Date(),
            updated_at: new Date(), 
        },
    });

    await prisma.user_progress.create({
        data: {
            user_id: 1,
            path_id: 1,
            topic_completed: 'Async/Await and Promises',
            completion_date: new Date(),
            skill_level: 'intermediate',
            streak_days: 5,
            time_spent_minutes: 90,
            achievement_earned: 'Async Explorer Badge',
            notes: 'Mastered async/await basics — needs deeper testing practice',
            created_at: new Date(),
            updated_at: new Date(), 
        },
    });



    await prisma.project_statistics.create({
        data: {
            project_id: 1,
            average_quality_score: 85,
            average_complexity_score: 75,
            average_security_score: 90,
            language_distribution: {
                javascript: 95,
                html: 5
            },
            total_files: 7,  
            total_dirs: 3,
            total_tests: 12,         
            total_issues: 3,         
            total_lines_of_code: 120,
            total_functions: 5,
            total_classes: 1,
            created_at: new Date(),
            updated_at: new Date(),
        }
    });

    // 2️⃣ Add project stack items
    await prisma.project_stack_items.createMany({
        data: [
            {
                project_id: 1,
                name: 'typescript',
                type: 'language'
            },
            {
                project_id: 1,
                name: 'react',
                type: 'framework'
            },
            {
                project_id: 1,
                name: 'jest',
                type: 'tool'
            }
        ]
    });

    await prisma.analysis_events.createMany({
        data: [
            {
                project_id: 1,
                event_type: 'analysis_started',
                details: 'Analysis process initiated.',
                created_at: new Date(Date.now() - 5 * 60 * 1000),
            },
            {
                project_id: 1,
                event_type: 'project_completed',
                details: 'Analysis completed successfully.',
                created_at: new Date(Date.now() - 2 * 60 * 1000),
            },
            {
                project_id: 1,
                event_type: 'analysis_failed',
                details: 'Generated suggestions for improvement.',
                created_at: new Date(),
            }
        ]
    });



}

main()
    .then(() => {
        console.log('✅ Seed completed');
    })
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
