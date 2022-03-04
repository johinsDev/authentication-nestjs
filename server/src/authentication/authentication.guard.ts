import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly authentication: AuthenticationService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this.authentication.check().then((isAuthenticated) => {
      if (isAuthenticated) {
        const request = context.switchToHttp().getRequest();

        request.user = this.authentication.user;

        return isAuthenticated;
      }

      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    });
  }
}
