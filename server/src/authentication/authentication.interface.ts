export interface UserProvider<User extends any> {
  /**
   * Find a user using the primary key value
   */
  findById(id: string | number): Promise<User>;

  /**
   * Find a user by searching for their uids
   */
  findByUid(uid: string): Promise<User>;

  /**
   * Find a user using the remember me token
   */
  findByRememberMeToken(userId: string | number, token: string): Promise<User>;

  /**
   * Update remember token
   */
  updateRememberMeToken(authenticatable: User): Promise<void>;
}

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
