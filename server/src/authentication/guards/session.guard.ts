import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import * as Session from 'fastify-secure-session';
import { HashService } from 'src/hash/hash.service';
import { GuardContract, UserProvider } from '../authentication.interface';
import { BaseGuard } from './base.guard';

@Injectable()
export class SessionGuard extends BaseGuard implements GuardContract {
  constructor(
    @Inject('USER_PROVIDER')
    public readonly provider: UserProvider<any>,
    public readonly hash: HashService,
    @Inject(REQUEST)
    private readonly request: FastifyRequest & { session: Session.Session },
  ) {
    super('session', provider, hash);
  }

  /**
   * The name of the session key name
   */
  public get sessionKeyName() {
    return `auth_${this.name}`;
  }

  /**
   * Set the user id inside the session. Also forces the session module
   * to re-generate the session id
   */
  private setSession(userId: string | number) {
    this.request.session.set(this.sessionKeyName, userId);
  }

  async attempt(
    uid: string,
    password: string,
    remember?: boolean,
  ): Promise<any> {
    const user = await this.verifyCredentials(uid, password);
    await this.login(user, remember);
    return user;
  }

  /**
   * Login a user
   */
  public async login(user: any, remember?: boolean): Promise<void> {
    const providerUser = user;

    /**
     * Set session
     */
    this.setSession(providerUser.id);

    this.markUserAsLoggedIn(providerUser);

    return providerUser.user;
  }

  /**
   * Login user using their id
   */
  public async loginViaId(
    id: string | number,
    remember?: boolean,
  ): Promise<void> {
    const providerUser = await this.findById(id);

    await this.login(providerUser, remember);

    return providerUser;
  }

  /**
   * Clears user session and remember me cookie
   */
  private clearUserFromStorage() {
    this.request.session.delete();
    // this.clearRememberMeCookie()
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

    // /**
    //  * Attempt to authenticate the current request if not already authenticated. This
    //  * will help us get an instance of the current user
    //  */
    // if (!this.authenticationAttempted) {
    //   await this.check();
    // }

    // /**
    //  * If authentication passed, then re-generate the remember me token
    //  * for the current user.
    //  */
    // if (this.user) {
    //   const providerUser = await this.provider.getUserFor(this.user);

    //   // this.ctx.logger.trace('re-generating remember me token');
    //   // providerUser.setRememberMeToken(this.generateRememberMeToken());
    //   // await this.provider.updateRememberMeToken(providerUser);
    // }

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
