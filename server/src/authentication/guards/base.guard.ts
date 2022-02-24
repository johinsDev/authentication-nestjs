import { HashService } from 'src/hash/hash.service';
import { UserProvider } from '../authentication.interface';
import { InvalidCredentialsException } from '../execeptions/invalid-credentials.exeception';

export abstract class BaseGuard {
  constructor(
    public name: string,
    public provider: UserProvider<any>,
    public hash: HashService,
  ) {}

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
   * Accessor to know if user is logged in
   */
  public get isLoggedIn() {
    return !!this.user;
  }

  /**
   * Accessor to know if user is a guest. It is always opposite
   * of [[isLoggedIn]]
   */
  public get isGuest() {
    return !this.isLoggedIn;
  }

  /**
   * Lookup user using UID
   */
  private async lookupUsingUid(uid: string): Promise<any> {
    const providerUser = await this.provider.findByUid(uid);

    if (!providerUser) {
      throw InvalidCredentialsException.invalidUid(this.name);
    }

    return providerUser;
  }

  /**
   * Verify user password
   */
  private async verifyPassword(
    providerUser: any,
    password: string,
  ): Promise<void> {
    /**
     * Verify password or raise exception
     */
    // const verified = await providerUser.verifyPassword(password);
    const verified = await this.hash.verify(password, providerUser.password);

    if (!verified) {
      throw InvalidCredentialsException.invalidPassword(this.name);
    }
  }

  /**
      *
    /**
   * Marks user as logged-in
   */
  protected markUserAsLoggedIn(
    user: any,
    authenticated: boolean | undefined = true,
    viaRemember: boolean | undefined = true,
  ) {
    this.user = user;
    this.isLoggedOut = false;
    this.isAuthenticated = authenticated;
    this.viaRemember = viaRemember;
  }

  /**
   * Verifies user credentials
   */
  public async verifyCredentials(uid: string, password: string): Promise<any> {
    if (!uid || !password) {
      throw InvalidCredentialsException.invalidUid(this.name);
    }

    const providerUser = await this.lookupUsingUid(uid);

    await this.verifyPassword(providerUser, password);

    return providerUser;
  }

  /**
   * Finds user by their id and returns the provider user instance
   */
  protected async findById(id: string | number) {
    const providerUser = await this.provider.findById(id);

    if (!providerUser) {
      throw InvalidCredentialsException.invalidUid(this.name);
    }

    return providerUser;
  }

  /**
   * Marks the user as logged out
   */
  protected markUserAsLoggedOut() {
    this.isLoggedOut = true;
    this.isAuthenticated = false;
    this.viaRemember = false;
    this.user = null;
  }
}
