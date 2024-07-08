import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from '../middlewares/logger.middleware';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { BucketModule } from './bucket/bucket.module';
import { CronJobModule } from './schedules/cron-job.module';
import { AuthModule } from './auth/auth.module';
import { redisProvider } from './cache/redis.provider';
import { CacheModule } from '@nestjs/cache-manager';
import { ScoreModule } from './score/score.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV
        ? `.${process.env.NODE_ENV}.env`
        : '.env',
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
    }),
    UserModule,
    EventModule,
    BucketModule,
    AuthModule,
    CacheModule.register({
      redisProvider,
    }),
    CronJobModule,
    ScoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
