import { Inject, Injectable, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as Session from 'fastify-secure-session';
import { generateRandom, toMs } from 'src/utils/string';
import {
  ProviderUserContract,
  SessionGuardContract,
  UserProvider,
} from '../authentication.interface';
import { AuthenticationException } from '../execeptions/authentication.exception';
import { BaseGuard } from './base.guard';

@Injectable()
export class SessionGuard extends BaseGuard implements SessionGuardContract {
  constructor(
    @Inject('USER_PROVIDER')
    public readonly provider: UserProvider<any>,
    @Inject(REQUEST)
    private readonly request: FastifyRequest & { session: Session.Session },
    private readonly emitter: EventEmitter2,
  ) {
    super('session', provider);
  }

  private readonly logger = new Logger('SessionGuard');

  /**
   * Number of years for the remember me token expiry
   */
  private rememberMeTokenExpiry = '5y';

  /**
   * The name of the session key name
   */
  public get sessionKeyName() {
    return `auth_${this.name}`;
  }

  /**
   * The name of the session key name
   */
  public get rememberMeKeyName() {
    return `remember_${this.name}`;
  }

  /**
   * Returns the session object from the context.
   */
  private getSession() {
    return this.request.session;
  }

  /**
   * Set the user id inside the session. Also forces the session module
   * to re-generate the session id
   */
  private setSession(userId: string | number) {
    this.getSession().set(this.sessionKeyName, userId);
  }

  /**
   * Generate remember me token
   */
  private generateRememberMeToken(): string {
    return generateRandom(20);
  }

  /**
   * Sets the remember me cookie with the remember me token
   */
  private setRememberMeCookie(
    userId: string | number,
    token: string,
    res: FastifyReply,
  ) {
    const value = {
      id: userId,
      token: token,
    };

    res.setCookie(this.rememberMeKeyName, JSON.stringify(value), {
      httpOnly: true,
      maxAge: toMs(this.rememberMeTokenExpiry),
      signed: true,
    });
  }

  /**
   * Clears user session and remember me cookie
   */
  private clearUserFromStorage() {
    this.request.session.delete();
  }

  /**
   * Returns data packet for the login event. Arguments are
   *
   * - The mapping identifier
   * - Logged in user
   * - HTTP context
   * - Remember me token (optional)
   */
  private getLoginEventData(user: any, token: string | null) {
    return {
      name: this.name,
      user,
      token,
    };
  }

  /**
   * Returns data packet for the authenticate event. Arguments are
   *
   * - The mapping identifier
   * - Logged in user
   * - HTTP context
   * - A boolean to tell if logged in viaRemember or not
   */
  private getAuthenticateEventData(user: any, viaRemember: boolean) {
    return {
      name: this.name,

      user,
      viaRemember,
    };
  }

  /**
   * Returns the user id for the current HTTP request
   */
  private getRequestSessionId() {
    return this.getSession().get(this.sessionKeyName);
  }

  /**
   * Verifies the remember me token
   */
  private verifyRememberMeToken(
    rememberMeToken: any,
  ): asserts rememberMeToken is { id: string; token: string } {
    if (!rememberMeToken || !rememberMeToken.id || !rememberMeToken.token) {
      throw AuthenticationException.invalidSession(this.name);
    }
  }

  /**
   * Returns user from the user session id
   */
  private async getUserForSessionId(id: string | number) {
    const authenticatable = await this.provider.findById(id);
    if (!authenticatable.user) {
      throw AuthenticationException.invalidSession(this.name);
    }

    return authenticatable;
  }

  /**
   * Returns user for the remember me token
   */
  private async getUserForRememberMeToken(id: string, token: string) {
    const authenticatable = await this.provider.findByRememberMeToken(
      id,
      token,
    );
    if (!authenticatable.user) {
      throw AuthenticationException.invalidSession(this.name);
    }

    return authenticatable;
  }

  /**
   * Returns the remember me token of the user that is persisted
   * inside the db. If not persisted, we create one and persist
   * it
   */
  private async getPersistedRememberMeToken(
    providerUser: ProviderUserContract<any>,
  ): Promise<string> {
    /**
     * Create and persist the user remember me token, when an existing one is missing
     */

    if (!providerUser.getRememberMeToken()) {
      this.logger.log('generating fresh remember me token');

      providerUser.setRememberMeToken(this.generateRememberMeToken());

      await this.provider.updateRememberMeToken(providerUser);
    }

    return providerUser.getRememberMeToken()!;
  }

  /**
   * Verify user credentials and perform login
   */
  async attempt(
    uid: string,
    password: string,
    remember?: boolean,
    res?: FastifyReply,
  ): Promise<any> {
    const user = await this.verifyCredentials(uid, password);
    await this.login(user, remember, res);
    return user;
  }

  /**
   * Login user using their id
   */
  public async loginViaId(
    id: string | number,
    remember?: boolean,
    res?: FastifyReply,
  ): Promise<any> {
    const providerUser = await this.findById(id);

    await this.login(providerUser, remember, res);

    return providerUser;
  }

  /**
   * Login a user
   */
  public async login(
    user: any,
    remember?: boolean,
    res?: FastifyReply,
  ): Promise<void> {
    // const providerUser = await this.getUserForLogin(user, this.config.provider.identifierKey)
    const providerUser = await this.getUserForLogin(user);

    /**
     * getUserForLogin raises exception when id is missing, so we can
     * safely assume it is defined
     */
    const id = providerUser.getId()!;

    /**
     * Set session
     */
    this.setSession(id);

    /**
     * Set remember me token when enabled
     */
    if (remember && res) {
      const rememberMeToken = await this.getPersistedRememberMeToken(
        providerUser,
      );

      this.logger.log('setting remember me cookie', {
        name: this.rememberMeKeyName,
      });

      this.setRememberMeCookie(id, rememberMeToken, res);
    }

    /**
     * Emit login event. It can be used to track user logins and their devices.
     */
    this.emitter.emit(
      'session:login',
      this.getLoginEventData(providerUser, providerUser.getRememberMeToken()),
    );

    this.markUserAsLoggedIn(providerUser);

    return providerUser.user;
  }

  /**
   * Authenticates the current HTTP request by checking for the user
   * session.
   */
  public async authenticate(res?: FastifyReply): Promise<any> {
    if (this.authenticationAttempted) {
      return this.user;
    }

    this.authenticationAttempted = true;
    const sessionId = this.getRequestSessionId();

    /**
     * If session id exists, then attempt to login the user using the
     * session and return early
     */
    if (sessionId) {
      const providerUser = await this.getUserForSessionId(sessionId);

      this.markUserAsLoggedIn(providerUser.user, true);

      this.emitter.emit(
        'session:authenticate',
        this.getAuthenticateEventData(providerUser.user, false),
      );

      return this.user;
    }

    /**
     * Otherwise look for remember me token. Raise exception, if both remember
     * me token and session id are missing.
     */
    const rememberMeToken = this.request.cookies[this.rememberMeKeyName];

    if (!rememberMeToken) {
      throw AuthenticationException.invalidSession(this.name);
    }

    /**
     * Ensure remember me token is valid after reading it from the cookie
     */
    this.verifyRememberMeToken(rememberMeToken);

    /**
     * Attempt to locate the user for remember me token
     */
    const providerUser = await this.getUserForRememberMeToken(
      rememberMeToken.id,
      rememberMeToken.token,
    );

    this.setSession(providerUser.user.getId());

    this.setRememberMeCookie(rememberMeToken.id, rememberMeToken.token, res);

    this.markUserAsLoggedIn(providerUser.user, true, true);

    return this.user;
  }

  /**
   * Same as [[authenticate]] but returns a boolean over raising exceptions
   */
  public async check(): Promise<boolean> {
    try {
      await this.authenticate();
    } catch (error) {
      /**
       * Throw error when it is not an instance of the authentication
       */
      if (error instanceof AuthenticationException === false) {
        throw error;
      }

      this.logger.log(error, 'Authentication failure');
    }

    return this.isAuthenticated;
  }

  /**
   * Logout by clearing session and cookies
   */
  public async logout(recycleRememberToken?: boolean) {
    /**
     * Return early when not attempting to re-generate the remember me token
     */
    if (!recycleRememberToken) {
      this.clearUserFromStorage();
      this.markUserAsLoggedOut();
      return;
    }

    /**
     * Attempt to authenticate the current request if not already authenticated. This
     * will help us get an instance of the current user
     */
    if (!this.authenticationAttempted) {
      await this.check();
    }

    /**
     * If authentication passed, then re-generate the remember me token
     * for the current user.
     */
    if (this.user) {
      const providerUser = await this.provider.getUserFor(this.user);

      this.logger.log('re-generating remember me token');
      // providerUser.setRememberMeToken(this.generateRememberMeToken());
      await this.provider.updateRememberMeToken(providerUser);
    }

    /**
     * Logout user
     */
    this.clearUserFromStorage();
    this.markUserAsLoggedOut();
  }

  /**
   * Serialize toJSON for JSON.stringify
   */
  public toJSON() {
    return {
      isLoggedIn: this.isLoggedIn,
      isGuest: this.isGuest,
      viaRemember: this.viaRemember,
      authenticationAttempted: this.authenticationAttempted,
      isAuthenticated: this.isAuthenticated,
      user: this.user,
    };
  }
}
