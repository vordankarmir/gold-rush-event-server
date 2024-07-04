import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { HttpExceptionFilter } from '../middlewares/http-exception.filter';

const PORT = parseInt(process.env.PORT, 10) || 3001;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(helmet());
  app.use(compression());

  await app.listen(PORT, () =>
    console.log(`🚀 Application is running at port ${PORT}`),
  );
}

bootstrap();
