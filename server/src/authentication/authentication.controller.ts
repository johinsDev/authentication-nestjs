import { Body, Controller, Delete, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
interface SignInDTO {
  username: string;
  password: string;
}

@Controller({
  path: 'auth',
})
export class AuthenticationController {
  constructor(private readonly auth: AuthenticationService) {}

  @Delete('/logout')
  async logout() {
    return this.auth.logout();
  }

  @Post('/login')
  async login(@Body() body: SignInDTO) {
    // console.log(this.auth.toJSON());

    await this.auth.loginViaId(1);

    // await this.auth.attempt(body.username, body.password);
    return this.auth.toJSON();
  }
}
