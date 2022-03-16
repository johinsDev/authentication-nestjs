import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserEntity } from './authentication/user.entity';
import { typeOrmModuleOptions } from './config/orm.config';
import { HashModule } from './hash/hash.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [typeOrmModuleOptions],
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigService],
      useFactory: (config: ConfigService) => {
        const database = config.get<TypeOrmModuleOptions>('database');

        return database;
      },
    }),
    EventEmitterModule.forRoot({}),
    HashModule,
    AuthenticationModule.forRoot({
      default: 'api',
      list: {
        api: {
          driver: 'session',
          // implementation: () => new SessionGuard(),
          provider: {
            driver: 'typeorm',
            model: () => UserEntity,
            uids: ['email'],
          },
          // implementation: (provider) =>  new SessionGuard(provider, )
        },
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
