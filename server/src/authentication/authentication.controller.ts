import { Body, Controller, Delete, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { HashService } from 'src/hash/hash.service';
import { AuthenticationService } from './authentication.service';
interface SignInDTO {
  username: string;
  password: string;
  rememberMe?: boolean;
}

@Controller({
  path: 'auth',
})
export class AuthenticationController {
  constructor(
    private readonly auth: AuthenticationService,
    private readonly hash: HashService,
  ) {}

  @Delete('/logout')
  async logout() {
    return this.auth.logout();
  }

  @Post('/login')
  async login(
    @Body() body: SignInDTO,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    // console.log(this.auth.toJSON());

    await this.auth.attempt(body.username, body.password, body.rememberMe, res);
    return this.auth.toJSON();
  }
}
