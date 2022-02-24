import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  public guard: string;

  constructor(response: string | Record<string, any>, status: number) {
    super(response, status);
  }

  public static invalidUid(guard: string) {
    const error = new this('User not found', HttpStatus.BAD_REQUEST);
    error.guard = guard;
    return error;
  }

  /**
   * Invalid user password
   */
  public static invalidPassword(guard: string) {
    const error = new this('Password mis-match', HttpStatus.BAD_REQUEST);
    error.guard = guard;
    return error;
  }
}
