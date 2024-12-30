import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateVacancyStatusDateColumn1735539407447 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, preserve existing data by creating a new column
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            ADD COLUMN "temp_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        `);

        // Copy data from the old column to the new one
        await queryRunner.query(`
            UPDATE "VacancyStatus" 
            SET "temp_date" = "date"
        `);

        // Drop the old column
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            DROP COLUMN "date"
        `);

        // Rename the new column to the original name
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            RENAME COLUMN "temp_date" TO "date"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // In case we need to rollback, convert back to a CreateDateColumn
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            ADD COLUMN "temp_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);

        // Copy data back
        await queryRunner.query(`
            UPDATE "VacancyStatus" 
            SET "temp_date" = "date"
        `);

        // Drop the timezone-aware column
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            DROP COLUMN "date"
        `);

        // Rename the new column to the original name
        await queryRunner.query(`
            ALTER TABLE "VacancyStatus" 
            RENAME COLUMN "temp_date" TO "date"
        `);
    }
}
