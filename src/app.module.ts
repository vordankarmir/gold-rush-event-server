import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from '../middlewares/logger.middleware';

const { DATABASE_URI, DATABASE_NAME } = process.env;
console.log(DATABASE_URI);
console.log(DATABASE_NAME);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV
        ? `.${process.env.NODE_ENV}.env`
        : '.env',
    }),
    // ThrottlerModule.forRoot([{ limit: 10, ttl: 60 }]),
    MongooseModule.forRoot(process.env.DATABASE_URI, { dbName: DATABASE_NAME }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}