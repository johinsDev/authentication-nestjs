import { Module, Provider } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import {
  AuthenticationService,
  Driver,
  JWTDriver,
  RedisUserRepository,
  SessionDriver,
  TypeormUserRepository,
} from './services/authentication.service';

type Drivers = 'JWT' | 'SESSION';

type UserRepositories = 'REDIS' | 'TYPEORM';

type JWTOptions = {
  secret?: string;
};

type SessionOptions = {
  cookieName?: string;
};

type DriverOptions =
  | { driver: 'JWT'; useRepository: UserRepositories; options: JWTOptions }
  | {
      driver: 'SESSION';
      useRepository: UserRepositories;
      options: SessionOptions;
    };

interface AuthenticationOptions {
  default: string;
  guards: Record<string, DriverOptions>;
}

const options: AuthenticationOptions = {
  default: 'API',
  guards: {
    API: {
      useRepository: 'TYPEORM',
      driver: 'JWT',
      options: {
        secret: 'SECRET',
      },
    },
    API2: {
      driver: 'JWT',
      useRepository: 'TYPEORM',
      options: {
        secret: 'SECRET2',
      },
    },
    API3: {
      driver: 'SESSION',
      useRepository: 'REDIS',
      options: {
        cookieName: 'COOKIE NAME',
      },
    },
  },
};

const providers: Provider[] = [];

const INJECTED_GUARDS = [];

Object.entries(options.guards).forEach(([guardName, options]) => {
  const optionProvider = {
    provide: `${guardName}_OPTIONS`,
    useValue: options,
  };

  const userRepositoryProvider = {
    provide: `${guardName}_${options.useRepository}_REPOSITORY`,
    useFactory: (options) => {
      switch (options.useRepository) {
        case 'REDIS':
          return new RedisUserRepository(options);
        case 'TYPEORM':
          return new TypeormUserRepository(options);
      }
    },
    inject: [`${guardName}_OPTIONS`],
  };

  const driverProvider = {
    provide: `${guardName}_${options.driver}_DRIVER`,
    useFactory: (options, userRepository) => {
      switch (options.driver) {
        case 'JWT':
          return new JWTDriver(options, userRepository);
        case 'SESSION':
          return new SessionDriver(options, userRepository);
      }
    },
    inject: [
      `${guardName}_OPTIONS`,
      `${guardName}_${options.useRepository}_REPOSITORY`,
    ],
  };

  INJECTED_GUARDS.push(`${guardName}_${options.driver}_DRIVER`);

  providers.push(optionProvider, userRepositoryProvider, driverProvider);
});

const authenticationProvider = {
  provide: AuthenticationService,
  useFactory: (...args: Driver[]) => {
    return new AuthenticationService(
      new Map(
        args.map((driver, index) => [
          Object.keys(options.guards)[index],
          driver,
        ]),
      ),
    );
  },
  inject: INJECTED_GUARDS,
};

@Module({
  controllers: [UsersController],
  providers: [
    ...providers,
    authenticationProvider,
    // {
    //   provide: 'API_OPTIONS',
    //   useValue: {
    //     fieldName: 'email',
    //   },
    // },
    // {
    //   provide: 'API_REDIS_USER_REPOSITORY',
    //   useFactory: (options) => {
    //     return new RedisUserRepository(options);
    //   },
    //   inject: ['API_OPTIONS'],
    // },
    // {
    //   provide: 'API_TYPEORM_USER_REPOSITORY',
    //   useClass: TypeormUserRepository,
    // },
    // // {
    // //   provide: 'API_JWT',
    // //   useClass: JWTDriver,
    // // },
    // {
    //   provide: 'API_JWT',
    //   useFactory: (repository: UserRepository) => {
    //     return new JWTDriver(repository);
    //   },
    //   inject: ['API_REDIS_USER_REPOSITORY'],
    // },
  ],
  exports: [AuthenticationService],
})
export class UsersModule {}
