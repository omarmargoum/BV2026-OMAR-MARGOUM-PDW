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

import {
  HealthModule,
} from '../src/core/health/index.js';

describe(
  'Health API E2E',
  (): void => {
    let app:
      INestApplication;

    beforeAll(
      async (): Promise<void> => {
        const moduleFixture:
          TestingModule =
          await Test
            .createTestingModule({
              imports: [
                HealthModule,
              ],
            })
            .compile();

        app =
          moduleFixture
            .createNestApplication();

        await app.init();
      },
    );

    afterAll(
      async (): Promise<void> => {
        await app.close();
      },
    );

    it(
      'GET /health/live doit retourner 200',
      async (): Promise<void> => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .get(
              '/health/live',
            )
            .expect(200);

        expect(
          response.body,
        ).toEqual(
          expect.objectContaining({
            status:
              expect.any(String),
          }),
        );
      },
    );
  },
);