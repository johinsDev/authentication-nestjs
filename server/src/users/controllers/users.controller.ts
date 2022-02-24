import { Controller, Post, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthenticationService } from '../services/authentication.service';

@Controller('users')
export class UsersController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post()
  async index(@Req() req: FastifyRequest) {
    // const data = await req.file();
    // console.log(data);

    return this.authenticationService.attempt();
  }
}
