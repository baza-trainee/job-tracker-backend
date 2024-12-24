import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateRejectReasonEnumValues1735044436165 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create a temporary column
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            ADD COLUMN "rejectReason_new" text
        `);

        // Copy the data to the new column
        await queryRunner.query(`
            UPDATE "VacancyStatus" 
            SET "rejectReason_new" = CASE "rejectReason"::text
                WHEN 'SoftSkills' THEN 'SOFT_SKILLS'
                WHEN 'TechSkills' THEN 'TECH_SKILLS'
                WHEN 'English' THEN 'ENGLISH'
                WHEN 'experience' THEN 'EXPERIENCE'
                WHEN 'stoped' THEN 'STOPPED'
                WHEN 'no_answer' THEN 'NO_ANSWER'
                WHEN 'other' THEN 'OTHER'
                ELSE "rejectReason"::text
            END
            WHERE "rejectReason" IS NOT NULL
        `);

        // Drop the old column
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            DROP COLUMN "rejectReason"
        `);

        // Create new enum type
        await queryRunner.query(`
            CREATE TYPE "VacancyStatus_rejectreason_enum_new" AS ENUM (
                'SOFT_SKILLS', 'TECH_SKILLS', 'ENGLISH', 'EXPERIENCE', 'STOPPED', 'NO_ANSWER', 'OTHER'
            )
        `);

        // Add the new column with the new enum type
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            ADD COLUMN "rejectReason" "VacancyStatus_rejectreason_enum_new"
        `);

        // Copy the data to the new enum column
        await queryRunner.query(`
            UPDATE "VacancyStatus" 
            SET "rejectReason" = "rejectReason_new"::"VacancyStatus_rejectreason_enum_new"
            WHERE "rejectReason_new" IS NOT NULL
        `);

        // Drop the temporary column
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            DROP COLUMN "rejectReason_new"
        `);

        // Drop the old enum type
        await queryRunner.query(`
            DROP TYPE "VacancyStatus_rejectreason_enum"
        `);

        // Rename the new enum type to the original name
        await queryRunner.query(`
            ALTER TYPE "VacancyStatus_rejectreason_enum_new" 
            RENAME TO "VacancyStatus_rejectreason_enum"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Create a temporary column
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            ADD COLUMN "rejectReason_new" text
        `);

        // Copy the data back to original format
        await queryRunner.query(`
            UPDATE "VacancyStatus" 
            SET "rejectReason_new" = CASE "rejectReason"::text
                WHEN 'SOFT_SKILLS' THEN 'SoftSkills'
                WHEN 'TECH_SKILLS' THEN 'TechSkills'
                WHEN 'ENGLISH' THEN 'English'
                WHEN 'EXPERIENCE' THEN 'experience'
                WHEN 'STOPPED' THEN 'stoped'
                WHEN 'NO_ANSWER' THEN 'no_answer'
                WHEN 'OTHER' THEN 'other'
                ELSE "rejectReason"::text
            END
            WHERE "rejectReason" IS NOT NULL
        `);

        // Drop the current column
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            DROP COLUMN "rejectReason"
        `);

        // Create old enum type
        await queryRunner.query(`
            CREATE TYPE "VacancyStatus_rejectreason_enum_old" AS ENUM (
                'SoftSkills', 'TechSkills', 'English', 'experience', 'stoped', 'no_answer', 'other'
            )
        `);

        // Add the column with the old enum type
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            ADD COLUMN "rejectReason" "VacancyStatus_rejectreason_enum_old"
        `);

        // Copy the data to the enum column
        await queryRunner.query(`
            UPDATE "VacancyStatus" 
            SET "rejectReason" = "rejectReason_new"::"VacancyStatus_rejectreason_enum_old"
            WHERE "rejectReason_new" IS NOT NULL
        `);

        // Drop the temporary column
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            DROP COLUMN "rejectReason_new"
        `);

        // Drop the current enum type
        await queryRunner.query(`
            DROP TYPE "VacancyStatus_rejectreason_enum"
        `);

        // Rename the old enum type to the original name
        await queryRunner.query(`
            ALTER TYPE "VacancyStatus_rejectreason_enum_old" 
            RENAME TO "VacancyStatus_rejectreason_enum"
        `);
    }
}
