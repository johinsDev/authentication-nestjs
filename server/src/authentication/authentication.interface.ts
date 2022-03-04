import { FastifyReply } from 'fastify';
import { UserEntity } from './user.entity';

/*
  |--------------------------------------------------------------------------
  | Guards
  |--------------------------------------------------------------------------
  */

export interface GuardContract {
  name: string;

  /**
   * Reference to the logged in user.
   */
  user?: any;

  /**
   * Find if the user has been logged out in the current request
   */
  isLoggedOut: boolean;

  /**
   * A boolean to know if user is a guest or not. It is
   * always opposite of [[isLoggedIn]]
   */
  isGuest: boolean;

  /**
   * A boolean to know if user is logged in or not
   */
  isLoggedIn: boolean;

  /**
   * A boolean to know if user is retrieved by authenticating
   * the current request or not.
   */
  isAuthenticated: boolean;

  /**
   * Whether or not the authentication has been attempted
   * for the current request
   */
  authenticationAttempted: boolean;

  /**
   * Reference to the provider for looking up the user
   */
  provider: UserProvider<any>;

  /**
   * Verify user credentials.
   */
  verifyCredentials(uid: string, password: string): Promise<any>;

  /**
   * Attempt to verify user credentials and perform login
   */
  attempt(uid: string, password: string, ...args: any[]): Promise<any>;

  /**
   * Login a user without any verification
   */
  login(user: any, ...args: any[]): Promise<any>;

  /**
   * Login a user using their id
   */
  loginViaId(id: string | number, ...args: any[]): Promise<any>;

  /**
   * Attempts to authenticate the user for the current HTTP request. An exception
   * is raised when unable to do so
   */
  authenticate(): Promise<any>;

  /**
   * Attempts to authenticate the user for the current HTTP request and supresses
   * exceptions raised by the [[authenticate]] method and returns a boolean
   */
  check(): Promise<boolean>;

  /**
   * Logout user
   */
  logout(...args: any[]): Promise<void>;

  /**
   * Serialize guard to JSON
   */
  toJSON(): any;
}

/*
  |--------------------------------------------------------------------------
  | Session Guard
  |--------------------------------------------------------------------------
  */

/**
 * Shape of the session guard
 */
export interface SessionGuardContract extends GuardContract {
  /**
   * A boolean to know if user is loggedin via remember me token or not.
   */
  viaRemember: boolean;

  /**
   * Attempt to verify user credentials and perform login
   */
  attempt(
    uid: string,
    password: string,
    remember?: boolean,
    res?: FastifyReply,
  ): Promise<any>;

  /**
   * Login a user without any verification
   */
  login(user: any, remember?: boolean, res?: FastifyReply): Promise<any>;

  /**
   * Login a user using their id
   */
  loginViaId(id: string | number, remember?: boolean): Promise<any>;

  /**
   * Logout user
   */
  logout(renewRememberToken?: boolean): Promise<void>;
}

/**
 * Provider user works as a bridge between the provider real user
 * and the guard. It is never exposed to the end-user.
 */
export interface ProviderUserContract<User extends any> {
  user: User | null;
  getId(): string | number | null;
  verifyPassword: (plainPassword: string) => Promise<boolean>;
  getRememberMeToken(): string | null;
  setRememberMeToken(token: string): void;
}

export interface UserProvider<User extends any> {
  /**
   * Return an instance of the user wrapped inside the Provider user contract
   */
  getUserFor(user: User): ProviderUserContract<User>;

  /**
   * Find a user using the primary key value
   */
  findById(id: string | number): Promise<ProviderUserContract<User>>;

  /**
   * Find a user by searching for their uids
   */
  findByUid(uid: string): Promise<ProviderUserContract<User>>;

  /**
   * Find a user using the remember me token
   */
  findByRememberMeToken(
    userId: string | number,
    token: string,
  ): Promise<ProviderUserContract<User>>;

  /**
   * Update remember token
   */
  updateRememberMeToken(
    authenticatable: ProviderUserContract<UserEntity>,
  ): Promise<void>;
}
