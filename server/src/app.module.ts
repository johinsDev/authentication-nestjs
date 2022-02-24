import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthenticationModule } from './authentication/authentication.module';
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
    HashModule,
    AuthenticationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
