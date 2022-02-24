export interface UserProvider<User extends any> {
  /**
   * Find a user using the primary key value
   */
  findById(id: string | number): Promise<User>;

  /**
   * Find a user by searching for their uids
   */
  findByUid(uid: string): Promise<User>;
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
   * Logout user
   */
  logout(...args: any[]): Promise<void>;

  /**
   * Serialize guard to JSON
   */
  toJSON(): any;
}
