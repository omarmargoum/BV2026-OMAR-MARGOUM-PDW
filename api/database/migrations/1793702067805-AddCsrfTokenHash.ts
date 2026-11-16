import type {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class AddCsrfTokenHash1793702067805
  implements MigrationInterface
{
  name =
    'AddCsrfTokenHash1793702067805';

  async up(
    queryRunner:
      QueryRunner,
  ): Promise<void> {
    /*
     * Les anciennes sessions ne possèdent
     * aucun token CSRF. Elles sont donc
     * révoquées avant de rendre la colonne
     * obligatoire.
     */
    await queryRunner.query(`
      ALTER TABLE "auth_session"
      ADD COLUMN "csrf_token_hash"
      character varying(64)
    `);

    await queryRunner.query(`
      UPDATE "auth_session"
      SET
        "csrf_token_hash" = repeat('0', 64),
        "revoked_at" = COALESCE(
          "revoked_at",
          CURRENT_TIMESTAMP
        )
      WHERE "csrf_token_hash" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "auth_session"
      ALTER COLUMN "csrf_token_hash"
      SET NOT NULL
    `);
  }

  async down(
    queryRunner:
      QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "auth_session"
      DROP COLUMN "csrf_token_hash"
    `);
  }
}