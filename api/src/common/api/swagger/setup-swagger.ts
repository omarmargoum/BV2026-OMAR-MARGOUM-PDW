import type {
  INestApplication,
} from '@nestjs/common';

import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

export const setupSwagger = (
  app: INestApplication,
): void => {
  const config =
    new DocumentBuilder()
      .setTitle('BV2026 API')
      .setDescription(
        'Documentation de l’API NestJS',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );

  SwaggerModule.setup(
    'documentation',
    app,
    document,
  );
};