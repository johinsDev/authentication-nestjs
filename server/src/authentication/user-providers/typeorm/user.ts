/*
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ProviderUserContract } from 'src/authentication/authentication.interface';
import { TypeormUserProviderConfig } from 'src/authentication/authentication.module';
import { HashService } from 'src/hash/hash.service';
import { ObjectLiteral } from 'typeorm';

/**
 * Lucid works works a bridge between the provider and the guard
 */
export class TypemORMUser<UserEntity extends ObjectLiteral>
  implements ProviderUserContract<UserEntity>
{
  constructor(
    private hash: HashService,
    public user: UserEntity,
    private config: TypeormUserProviderConfig,
  ) {}

  /**
   * Returns the value of the user id
   */
  public getId() {
    return this.user ? this.user[this.config.identifierKey] : null;
  }

  /**
   * Verifies the user password
   */
  public async verifyPassword(plainPassword: string): Promise<boolean> {
    if (!this.user) {
      throw new Error('Cannot "verifyPassword" for non-existing user');
    }
    /**
     * Ensure user has password
     */

    if (!this.user.password) {
      throw new Error(
        'Auth user object must have a password in order to call "verifyPassword"',
      );
    }

    return this.hash.verify(plainPassword, this.user!.password);
  }

  /**
   * Returns the user remember me token or null
   */
  public getRememberMeToken() {
    return this.user ? this.user.rememberMeToken || null : null;
  }

  /**
   * Updates user remember me token
   */
  public setRememberMeToken(token: string) {
    if (!this.user) {
      throw new Error('Cannot set "rememberMeToken" on non-existing user');
    }

    (this.user as any).rememberMeToken = token;
  }
}
