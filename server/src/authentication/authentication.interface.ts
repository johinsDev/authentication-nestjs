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
  /**
   * Attempt to verify user credentials and perform login
   */
  attempt(uid: string, password: string, ...args: any[]): Promise<any>;
}
