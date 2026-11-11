import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1793702067803 implements MigrationInterface {
    name = 'InitialSchema1793702067803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."account_status" AS ENUM('pending', 'active', 'disabled')`);
        await queryRunner.query(`CREATE TABLE "account" ("id" character varying(26) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "status" "public"."account_status" NOT NULL DEFAULT 'pending', CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."auth_identifier_type" AS ENUM('email')`);
        await queryRunner.query(`CREATE TABLE "auth_identifier" ("id" character varying(26) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "account_id" character varying(26) NOT NULL, "type" "public"."auth_identifier_type" NOT NULL, "value" character varying(320) NOT NULL, "normalized_value" character varying(320) NOT NULL, "verified_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_17dc86ed5a7e445e6ca41f50723" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_auth_identifier_account_id" ON "auth_identifier"  ("account_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_auth_identifier_type_normalized_value" ON "auth_identifier"  ("type", "normalized_value") `);
        await queryRunner.query(`CREATE TABLE "auth_session" ("id" character varying(26) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "account_id" character varying(26) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "last_seen_at" TIMESTAMP WITH TIME ZONE, "ip_address" character varying(45), "user_agent" text, CONSTRAINT "PK_19354ed146424a728c1112a8cbf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_auth_session_expires_at" ON "auth_session"  ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "idx_auth_session_account_id" ON "auth_session"  ("account_id") `);
        await queryRunner.query(`CREATE TABLE "auth_refresh_token" ("id" character varying(26) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "session_id" character varying(26) NOT NULL, "token_hash" character varying(64) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "revoked_at" TIMESTAMP WITH TIME ZONE, "replaced_by_token_id" character varying(26), CONSTRAINT "PK_57203170666c2ed599635e17a81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_auth_refresh_token_expires_at" ON "auth_refresh_token"  ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "idx_auth_refresh_token_session_id" ON "auth_refresh_token"  ("session_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_auth_refresh_token_token_hash" ON "auth_refresh_token"  ("token_hash") `);
        await queryRunner.query(`CREATE TABLE "password_credential" ("id" character varying(26) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "account_id" character varying(26) NOT NULL, "password_hash" text NOT NULL, "password_changed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "REL_1efdc6d44a9277910c368f00dc" UNIQUE ("account_id"), CONSTRAINT "PK_34b5bc8a1c951fba48c5d596599" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_password_credential_account_id" ON "password_credential"  ("account_id") `);
        await queryRunner.query(`ALTER TABLE "auth_identifier" ADD CONSTRAINT "FK_eb7da82e10cf2bbf0078aa00e5c" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth_session" ADD CONSTRAINT "FK_e4c520a0509e1853c3040fe6d33" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth_refresh_token" ADD CONSTRAINT "FK_c303c8b83f7d838b81297a6586d" FOREIGN KEY ("session_id") REFERENCES "auth_session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_credential" ADD CONSTRAINT "FK_1efdc6d44a9277910c368f00dc6" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_credential" DROP CONSTRAINT "FK_1efdc6d44a9277910c368f00dc6"`);
        await queryRunner.query(`ALTER TABLE "auth_refresh_token" DROP CONSTRAINT "FK_c303c8b83f7d838b81297a6586d"`);
        await queryRunner.query(`ALTER TABLE "auth_session" DROP CONSTRAINT "FK_e4c520a0509e1853c3040fe6d33"`);
        await queryRunner.query(`ALTER TABLE "auth_identifier" DROP CONSTRAINT "FK_eb7da82e10cf2bbf0078aa00e5c"`);
        await queryRunner.query(`DROP INDEX "public"."uq_password_credential_account_id"`);
        await queryRunner.query(`DROP TABLE "password_credential"`);
        await queryRunner.query(`DROP INDEX "public"."uq_auth_refresh_token_token_hash"`);
        await queryRunner.query(`DROP INDEX "public"."idx_auth_refresh_token_session_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_auth_refresh_token_expires_at"`);
        await queryRunner.query(`DROP TABLE "auth_refresh_token"`);
        await queryRunner.query(`DROP INDEX "public"."idx_auth_session_account_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_auth_session_expires_at"`);
        await queryRunner.query(`DROP TABLE "auth_session"`);
        await queryRunner.query(`DROP INDEX "public"."uq_auth_identifier_type_normalized_value"`);
        await queryRunner.query(`DROP INDEX "public"."idx_auth_identifier_account_id"`);
        await queryRunner.query(`DROP TABLE "auth_identifier"`);
        await queryRunner.query(`DROP TYPE "public"."auth_identifier_type"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TYPE "public"."account_status"`);
    }

}
