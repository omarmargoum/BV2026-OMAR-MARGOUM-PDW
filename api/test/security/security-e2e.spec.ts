import { 
  Test, 
  TestingModule 
} from '@nestjs/testing';
import {
   INestApplication, 
   HttpStatus 
  } from '@nestjs/common';
  import {
    describe,
    it,
    beforeAll,
    afterAll,
    expect
  } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../../src/root/index.js';

describe('Security E2E Attack Scenarios', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('devrait bloquer les requêtes modifiant des données sans en-tête Origin valide (OriginGuard / CSRF)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/protected-resource')
      .send({ sensitiveData: 'test' });

    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });

  it('devrait révoquer l ensemble de la session en cas de tentative de réutilisation d un Refresh Token déjà consommé (Vol de token)', async () => {
    // 1. Authentification initiale
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user@test.com', password: 'Password123!' });

    const refreshToken = loginRes.body.refreshToken;

    // 2. Première rotation valide
    const firstRefresh = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(firstRefresh.status).toBe(HttpStatus.OK);

    // 3. Deuxième tentative avec le même refresh token (simulation d'un attaquant)
    const attackAttempt = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(attackAttempt.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});