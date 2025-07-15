import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.users.create({
        data: {
            username: 'devpath_user',
            email: 'user@example.com',
            password_hash: 'hashed_password_123',
            user_status: 'active',
            updated_at: new Date(),
        },
    });

    await prisma.project_statuses.createMany({
        data: [
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
        ],
    });

    await prisma.projects.create({
        data: {
            user_id: 1,
            status_code: 'draft',
            project_name: 'Mock Project',
            total_files: 1,
            uploaded_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(), 
        },
    });

    await prisma.code_files.create({
        data: {
            project_id: 1,
            file_name: 'index.js',
            programming_lang: 'JavaScript',
            content: 'function greet() {\n  console.log("Hello World");\n}',
            file_size: 45,
            file_path: '/files/index.js',
            created_at: new Date(),
            updated_at: new Date(), 
        },
    });

    await prisma.analyses.create({
        data: {
            project_id: 1,
            file_id: 1,
            analysis_type: 'CODE_QUALITY',
            analysis_result: '✔ Code Analysis Complete\n✔ No critical issues detected\n\n🧠 Tips:\n- Consider using "const" over "var"\n- Add comments for clarity\n',
            issues_found: 'No major issues.\nConsider renaming variables for readability.',
            issues_count: 2,
            suggestions: '🛠️ Suggestions:\n1. Rename "greet" to "sayHello"\n2. Add function documentation',
            quality_score: 85,
            security_score: 90,
            complexity_score: 80,
            best_practices_score: 88,
            learning_gaps: 'Understanding variable scope\nImproving naming conventions',
            strengths: 'Consistent indentation\nClear structure',
            learning_recommendations: 'Focus on function documentation and async patterns',
            skill_level_assessments: 'intermediate',
            improvement_priority: 'medium',
            recommended_resources: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions',
            analysis_model: 'llama3-70b-8192',
            processing_time_ms: 1340,
            created_at: new Date(),
            updated_at: new Date(), 
        },
    });

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

    await prisma.agent_action_types.createMany({
        data: [
            { action_type: 'generate_path', description: 'Generate a personalized learning path' },
            { action_type: 'update_score', description: 'Update analysis or learning scores' },
            { action_type: 'suggest_topic', description: 'Suggest learning topics based on gaps' },
            { action_type: 'analyze_project', description: 'Run analysis on a project' },
            { action_type: 'send_reminder', description: 'Notify user of pending actions' },
            { action_type: 'log_progress', description: 'Record user progress on learning path' },
            { action_type: 'adjust_difficulty', description: 'Tune learning path difficulty' },
            { action_type: 'recommend_resource', description: 'Suggest external learning material' },
            { action_type: 'evaluate_skills', description: 'Assess skill level based on code or progress' },
            { action_type: 'summarize_project', description: 'Generate project-level summary' },
        ],
    });

    await prisma.agent_actions.create({
        data: {
            user_id: 1,
            project_id: 1,
            path_id: 1,
            agent_name: 'path-bot',
            action_type: 'generate_path',
            action_details:
                '🧠 Action:\nSuggested topics: Async/Await, Scope\nEstimated hours: 8\nReason: Skill gap detected in function structure\n',
            outcome: 'success',
            confidence_score: 0.92,
            triggered_by: 'system',
            created_at: new Date(),

        },
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
