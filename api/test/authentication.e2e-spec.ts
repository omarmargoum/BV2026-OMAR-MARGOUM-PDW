import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from '@jest/globals';

import type {
  INestApplication,
} from '@nestjs/common';

import {
  Test,
  type TestingModule,
} from '@nestjs/testing';

import request from 'supertest';

import { DataSource } from 'typeorm';

import {
  AppModule,
  configureApplication,
} from '../src/root/index.js';

describe(
  'Authentication E2E',
  (): void => {
    let app!:
      INestApplication;

    beforeAll(
      async (): Promise<void> => {
        const moduleFixture:
          TestingModule =
          await Test
            .createTestingModule({
              imports: [
                AppModule,
              ],
            })
            .compile();

        app =
          moduleFixture
            .createNestApplication();

        configureApplication(
          app,
        );

        await app.init();

        const dataSource =
          app.get(
            DataSource,
          );

        const databaseName =
          dataSource.options.database;

        if (
          databaseName !==
          'bv2026_e2e_test'
        ) {
          throw new Error(
            `Base E2E incorrecte : ${String(databaseName)}`,
          );
        }
      },
    );

    afterAll(
      async (): Promise<void> => {
        await app.close();
      },
    );

    it(
      'GET /auth/session sans token doit retourner 401',
      async (): Promise<void> => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .get(
              '/auth/session',
            )
            .expect(401);

        expect(
          response.body.code,
        ).toBe(
          'api.auth.unauthorized',
        );

        expect(
          response.body.result,
        ).toBe(false);
      },
    );
  },
);