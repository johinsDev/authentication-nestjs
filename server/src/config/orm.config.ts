import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmModuleOptions = registerAs('database', () => options);

export const options: TypeOrmModuleOptions = {
  type: <any>process.env.DB_DRIVER,
  host: process.env.DB_HOST,
  port: parseInt(<string>process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  /* Note : it is unsafe to use synchronize: true for schema synchronization
    on production once you get data in your database. */
  // synchronize: true,
  autoLoadEntities: true,
  logging: process.env.NODE_ENV !== 'prod',
};

export const OrmConfig = {
  ...options,
  migrationsTableName: 'migrations',
  migrations: ['src/migrations/*.ts'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default OrmConfig;
