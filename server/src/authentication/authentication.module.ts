import {
  DynamicModule,
  ForwardReference,
  Global,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getConnectionToken, TypeOrmModule } from '@nestjs/typeorm';
import { FastifyRequest } from 'fastify';
import { HashService } from 'src/hash/hash.service';
import {
  Connection,
  ConnectionOptions,
  EntitySchema,
  Repository,
} from 'typeorm';
import { AuthenticationController } from './authentication.controller';
import {
  GuardContract,
  SessionGuardContract,
  UserProvider,
} from './authentication.interface';
import { AuthenticationService } from './authentication.service';
import { SessionGuard } from './guards/session.guard';
import { TypeORMUserProvider } from './user-providers/typeorm/typeorm-user.provider';

export interface TypeormUserProviderConfig {
  driver: 'typeorm';
  uids?: string[]; // ['email]
  identifierKey?: string; // id;
  // eslint-disable-next-line @typescript-eslint/ban-types
  model: () => Function | EntitySchema;
  // options connection
  connection?: Connection | ConnectionOptions | string;
}

export interface AuthenticationModuleOptions {
  default: keyof AuthenticationModuleOptions['list'];
  list: Record<
    string,
    {
      driver: string;
      implementation?: (provider: UserProvider<any>) => SessionGuardContract;
      provider: TypeormUserProviderConfig;
    }
  >;
}

@Global()
@Module({
  controllers: [AuthenticationController],
})
export class AuthenticationModule {
  static forRoot(options: AuthenticationModuleOptions): DynamicModule {
    const providers: Provider[] = [];

    const drivers: string[] = [];

    const imports: Array<
      Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
    > = [];

    Object.entries(options.list).forEach(([guardName, options]) => {
      guardName = guardName.toUpperCase();

      const provide = `${guardName}_GUARD_${options.driver.toUpperCase()}`;

      const userProviderName = `${guardName}_PROVIDER_${options.provider.driver.toUpperCase()}`;

      const userProviderConfigName = `${guardName}_PROVIDER_${options.provider.driver.toUpperCase()}_CONFIG`;

      drivers.push(provide);

      // Instance config
      const config = {
        provide: userProviderConfigName,
        useValue: {
          uids: ['email'],
          identifierKey: 'id',
          ...options.provider,
        },
      };

      // Instance user providers
      const userProvider = [
        {
          provide: userProviderName,
          useFactory: (
            repository: Repository<any>,
            hash: HashService,
            config: TypeormUserProviderConfig,
          ) => {
            return new TypeORMUserProvider(repository, config, hash);
          },
          inject: ['USER_REPOSITORY', HashService, userProviderConfigName],
        },
        {
          provide: 'USER_REPOSITORY',
          useFactory: (connection: Connection) =>
            connection.getRepository(options.provider.model()),
          inject: [getConnectionToken(options.provider.connection)],
        },
      ];

      if (options.provider.model) {
        imports.push(TypeOrmModule.forFeature([options.provider.model()]));
      }

      // Instances guards
      const guardProvider = {
        provide,
        useFactory: (
          provider: UserProvider<any>,
          request: FastifyRequest,
          event: EventEmitter2,
        ) => {
          return new SessionGuard(provider, request, event);
        },
        inject: [userProviderName, REQUEST, EventEmitter2],
      };

      providers.push(config, ...userProvider, guardProvider);
    });

    // Instance authentication service
    providers.push({
      provide: AuthenticationService,
      useFactory: (...guards: GuardContract[]) => {
        return new AuthenticationService(
          new Map(
            guards.map((driver, index) => [
              Object.keys(options.list)[index],
              driver,
            ]),
          ),
        );
      },
      inject: drivers,
    });

    return {
      imports,
      module: AuthenticationModule,
      providers,
      exports: [AuthenticationService],
    };
  }
}
