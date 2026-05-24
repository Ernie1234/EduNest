import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const frontendUrl = config.getOrThrow<string>('FRONTEND_URL');

  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('EduNest API Documentation')
      .setDescription(
        'EduNest APIs Documentation with comprehensive API reference in Swagger UI.',
      )
      .setVersion('1.0.0')
      .setContact('EduNest Support', frontendUrl, '')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token (typically in Authorization header)',
        },
        'access_token',
      ) // <-- Fixed the stray text and broken brackets that were right below this
      .build();

    const documentFactory = () =>
      SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('/docs', app, documentFactory, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customCss: '.swagger-ui .topbar { display: none }',
    });
  }

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const rawPort = config.get<string>('PORT');
  const port = rawPort ? Number.parseInt(rawPort, 10) : 8080;
  await app.listen(Number.isFinite(port) ? port : 8080);
}

bootstrap();
