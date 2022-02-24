import { Injectable } from '@nestjs/common';

// {
//   "api": {
//     userRepository: 'typeorm',
//     driver: 'jwt',
//     options: {
//       secret: ''
//     }
//   },
//   "api2": {
//     userRepository: 'typeorm',
//     driver: 'jwt',
//     options: {
//       secret: ''
//     }
//   }
// }

export interface UserRepository {
  getUserById(): string;
}

export class TypeormUserRepository implements UserRepository {
  constructor(private readonly options?: any) {}

  getUserById(): string {
    console.log(this.options);

    return 'TYPEORM GET USER BY ID';
  }
}

export class RedisUserRepository implements UserRepository {
  constructor(private readonly options?: any) {}

  getUserById(): string {
    console.log(this.options);

    return 'REDIS GET USER BY ID';
  }
}

export interface Driver {
  attempt(): string;
}

@Injectable()
export class JWTDriver implements Driver {
  constructor(
    private readonly options: any,
    private readonly userRepository: UserRepository,
  ) {}

  attempt(): string {
    console.log(this.userRepository.getUserById());

    return 'JWT';
  }
}

// AuthenticationModule.forFeature(JWTDriver, 'API' {   })
// AuthenticationModule.forFeature(JWTDriver, 'API2' {   })

@Injectable()
export class SessionDriver implements Driver {
  constructor(
    private readonly options: any,
    private readonly userRepository: UserRepository,
  ) {}

  attempt(): string {
    console.log(this.userRepository.getUserById());

    return 'SESSION';
  }
}

@Injectable()
export class AuthenticationService implements Driver {
  constructor(private drivers: Map<string, Driver>) {}

  attempt(): string {
    return this.drivers.get('API').attempt();
    // return this.jwtDriver2.attempt();
  }
}
