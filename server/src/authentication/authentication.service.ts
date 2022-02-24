import { Inject, Injectable } from '@nestjs/common';
import { GuardContract } from './authentication.interface';

// private readonly hash: HashService, // private readonly repository: UserRepository, // @Inject(REQUEST) // private readonly request: FastifyRequest & { session: session.Session }, // @Inject('TYPEORM_USER_PROVIDER') // private readonly userProvider: UserProvider<any>,
@Injectable()
export class AuthenticationService {
  constructor(@Inject('GUARD') private readonly driver: GuardContract) {}

  async attempt(username: string, password: string): Promise<any> {
    return this.driver.attempt(username, password);
    // console.log(await this.userProvider.findByUid('johinsdev@gmail.com'));

    // const user = await this.repository.getByUsername(username);

    // if (!(await this.hash.verify(password, user.password))) {
    //   throw new HttpException('Password not valid', HttpStatus.UNAUTHORIZED);
    // }

    // this.request.session.set('id', user.id);

    // return true;
  }
}
