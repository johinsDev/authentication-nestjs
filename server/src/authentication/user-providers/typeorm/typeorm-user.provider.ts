import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ProviderUserContract,
  UserProvider,
} from 'src/authentication/authentication.interface';
import { UserEntity } from 'src/authentication/user.entity';
import { HashService } from 'src/hash/hash.service';
import { Repository } from 'typeorm';
import { TypemORMUser } from './user';

@Injectable()
export class TypeORMUserProvider implements UserProvider<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly hash: HashService,
  ) {}

  private uids: Array<keyof UserEntity> = ['email'];

  public get select(): Array<keyof UserEntity> {
    return ['id', ...this.uids, 'password', 'rememberMeToken'];
  }

  getUserFor(user: UserEntity): ProviderUserContract<UserEntity> {
    return new TypemORMUser(this.hash, user);
  }

  async findById(
    id: string | number,
  ): Promise<ProviderUserContract<UserEntity>> {
    const user = await this.repository.findOne(id, {
      select: this.select,
    });

    return this.getUserFor(user);
  }

  async findByUid(uid: string): Promise<ProviderUserContract<UserEntity>> {
    const user = await this.repository.findOne({
      select: this.select,
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
        id: providerUser.getId().toString(),
      },
      {
        rememberMeToken: providerUser.user.rememberMeToken,
      },
    );
  }
}
