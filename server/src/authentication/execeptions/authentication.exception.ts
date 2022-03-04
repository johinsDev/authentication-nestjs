import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthenticationException extends HttpException {
  public guard: string;

  constructor(response: string | Record<string, any>, status: number) {
    super(response, status);
  }

  public static invalidSession(guard: string) {
    const error = new this('Invalid session', HttpStatus.UNAUTHORIZED);
    error.guard = guard;
    return error;
  }
}
