import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
            total_lines_of_code: 120,
            total_functions: 5,
            total_classes: 1,
            created_at: new Date(),
            updated_at: new Date(),
        }
    });
    console.log("✅ Statistics seeded");
}

main().catch(console.error).finally(() => prisma.$disconnect());
