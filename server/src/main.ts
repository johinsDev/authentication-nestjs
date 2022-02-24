import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCompress from 'fastify-compress';
import fastifyHelmet from 'fastify-helmet';
import fastifyMultipart from 'fastify-multipart';
import fastifySession from 'fastify-secure-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );

  app.enableCors();

  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  app.register(fastifyMultipart);

  app.register(fastifyCompress);

  app.register(fastifySession, {
    secret: 'averylogphrasebiggerthanthirtytwochars',
    salt: 'mq9hDxBVDbspDR6n',
  });

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('Authentication')
    .setDescription('API with multiple guards authentication')
    .setVersion('1.0')
    .addTag('authentication')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
