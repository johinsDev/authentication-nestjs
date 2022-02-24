import { Body, Controller, Post } from '@nestjs/common';
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

  @Post('/sign-in')
  signIn(@Body() body: SignInDTO) {
    return this.auth.attempt(body.username, body.password);
  }
}
