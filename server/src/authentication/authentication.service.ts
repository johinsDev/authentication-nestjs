import { Inject, Injectable } from '@nestjs/common';
import { GuardContract } from './authentication.interface';

// @TODO
// Typeorm interface, AuthService interface
// Guard to silent, options in guard property in request, addToRequest, guards to review
// dynamic instance
// dynamic config

// OTA guard
// Token provider typeorm

// token provider redis
// user provider mongo

@Injectable()
export class AuthenticationService implements GuardContract {
  constructor(@Inject('GUARD') private readonly driver: GuardContract) {}

  /**
   * Returns an instance of a named or the default mapping
   */
  public use(mapping?: string) {
    return this.driver;
  }

  /**
   * Guard name for the default mapping
   */
  public get name() {
    return this.use().name;
  }

  /**
   * Reference to the logged in user
   */
  public get user() {
    return this.use().user;
  }

  // /**
  //  * Reference to the default guard config
  //  */
  // public get config() {
  //   return this.use().config;
  // }

  /**
   * Find if the user has been logged out in the current request
   */
  public get isLoggedOut() {
    return this.use().isLoggedOut;
  }

  /**
   * A boolean to know if user is a guest or not. It is
   * always opposite of [[isLoggedIn]]
   */
  public get isGuest() {
    return this.use().isGuest;
  }

  /**
   * A boolean to know if user is logged in or not
   */
  public get isLoggedIn() {
    return this.use().isLoggedIn;
  }

  /**
   * A boolean to know if user is retrieved by authenticating
   * the current request or not.
   */
  public get isAuthenticated() {
    return this.use().isAuthenticated;
  }

  /**
   * Whether or not the authentication has been attempted
   * for the current request
   */
  public get authenticationAttempted() {
    return this.use().authenticationAttempted;
  }

  /**
   * Reference to the provider for looking up the user
   */
  public get provider() {
    return this.use().provider;
  }

  /**
   * Verify user credentials.
   */
  public async verifyCredentials(uid: string, password: string) {
    return this.use().verifyCredentials(uid, password);
  }

  /**
   * Attempt to verify user credentials and perform login
   */
  public async attempt(uid: string, password: string, ...args: any[]) {
    return this.use().attempt(uid, password, ...args);
  }

  /**
   * Login a user without any verification
   */
  public async login(user: any, ...args: any[]) {
    return this.use().login(user, ...args);
  }

  /**
   * Login a user using their id
   */
  public async loginViaId(id: string | number, ...args: any[]) {
    return this.use().loginViaId(id, ...args);
  }

  /**
   * Attempts to authenticate the user for the current HTTP request. An exception
   * is raised when unable to do so
   */
  public async authenticate() {
    return this.use().authenticate();
  }

  /**
   * Attempts to authenticate the user for the current HTTP request and supresses
   * exceptions raised by the [[authenticate]] method and returns a boolean
   */
  public async check() {
    return this.use().check();
  }

  /**
   * Logout user
   */
  public async logout(...args: any[]) {
    return this.use().logout(...args);
  }

  /**
   * Serialize toJSON
   */
  public toJSON(): any {
    return this.use().toJSON();
  }
}
