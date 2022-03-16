import { Inject, Injectable } from '@nestjs/common';
import {
  ProviderUserContract,
  TypeormUserProvider,
} from 'src/authentication/authentication.interface';
import { TypeormUserProviderConfig } from 'src/authentication/authentication.module';
import { HashService } from 'src/hash/hash.service';
import { FindCondition, ObjectLiteral, Repository } from 'typeorm';
import { TypemORMUser } from './user';

@Injectable()
export class TypeORMUserProvider<UserEntity extends ObjectLiteral>
  implements TypeormUserProvider<UserEntity>
{
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly repository: Repository<UserEntity>,
    private readonly config: TypeormUserProviderConfig,
    private readonly hash: HashService,
  ) {}

  private uids = this.config.uids;

  private identifierKey = this.config.identifierKey;

  getUserFor(user: UserEntity): ProviderUserContract<UserEntity> {
    return new TypemORMUser(this.hash, user, this.config);
  }

  async findById(
    id: string | number,
  ): Promise<ProviderUserContract<UserEntity>> {
    const user = await this.repository.findOne(id);

    return this.getUserFor(user);
  }

  async findByUid(uid: string): Promise<ProviderUserContract<UserEntity>> {
    const user = await this.repository.findOne({
      where: this.uids.map((field) => {
        return {
          [field]: uid,
        };
      }),
    });

    return this.getUserFor(user);
  }

  async findByRememberMeToken(
    userId: string | number,
    token: string,
  ): Promise<ProviderUserContract<UserEntity>> {
    const user = await this.repository.findOne({
      where: {
        id: userId,
        rememberMeToken: token,
      },
    });

    return this.getUserFor(user);
  }

  updateRememberMeToken(
    providerUser: ProviderUserContract<UserEntity>,
  ): Promise<any> {
    return this.repository.update(
      {
        [this.identifierKey]: providerUser.getId().toString(),
      } as unknown as FindCondition<any>,
      {
        rememberMeToken: providerUser.user.rememberMeToken,
      },
    );
  }
}
