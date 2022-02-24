import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import * as Session from 'fastify-secure-session';
import { HashService } from 'src/hash/hash.service';
import { GuardContract, UserProvider } from '../authentication.interface';
import { InvalidCredentialsException } from '../execeptions/invalid-credentials.exeception';
import { BaseGuard } from './base.guard';

@Injectable()
export class SessionGuard extends BaseGuard implements GuardContract {
  constructor(
    @Inject('USER_PROVIDER')
    private readonly provider: UserProvider<any>,
    private readonly hash: HashService,
    @Inject(REQUEST)
    private readonly request: FastifyRequest & { session: Session.Session },
  ) {
    super();
  }

  public name = 'session';

  /**
   * Whether or not the authentication has been attempted
   * for the current request
   */
  public authenticationAttempted = false;

  /**
   * Find if the user has been logged out in the current request
   */
  public isLoggedOut = false;

  /**
   * A boolean to know if user is retrieved by authenticating
   * the current request or not
   */
  public isAuthenticated = false;

  /**
   * A boolean to know if user is loggedin via remember me token
   * or not.
   */
  public viaRemember = false;

  /**
   * Logged in or authenticated user
   */
  public user?: any;

  /**
   * The name of the session key name
   */
  public get sessionKeyName() {
    return `auth_${this.name}`;
  }

  async attempt(uid: string, password: string, ...args: any[]): Promise<any> {
    // validate params
    if (!uid || !password) {
      throw InvalidCredentialsException.invalidUid(this.name);
    }

    // get User
    const providerUser = await this.provider.findByUid(uid);

    if (!providerUser) {
      throw InvalidCredentialsException.invalidUid(this.name);
    }

    // Validated password
    const verified = await this.hash.verify(password, providerUser.password);

    if (!verified) {
      throw InvalidCredentialsException.invalidPassword(this.name);
    }

    // Save session

    this.request.session.set(this.sessionKeyName, providerUser.id);

    // Change params from class
    this.user = providerUser;
    this.isLoggedOut = false;
    this.isAuthenticated = true;

    return providerUser;
  }
}
