import type {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class AddAuthSessionSecurityContext1793702067804
  implements MigrationInterface
{
  name =
    'AddAuthSessionSecurityContext1793702067804';

  async up(
    queryRunner:
      QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "auth_session"
      ADD COLUMN "access_version" integer NOT NULL DEFAULT 1
    `);
  }

  async down(
    queryRunner:
      QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "auth_session"
      DROP COLUMN "access_version"
    `);
  }
}