import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProvider } from 'src/authentication/authentication.interface';
import { UserEntity } from 'src/authentication/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypeORMUserProvider implements UserProvider<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  private uids: Array<keyof UserEntity> = ['email'];

  public get select(): Array<keyof UserEntity> {
    return ['id', ...this.uids, 'password'];
  }

  findById(id: string | number): Promise<UserEntity> {
    return this.repository.findOne(id, {
      select: this.select,
    });
  }

  findByUid(uid: string): Promise<UserEntity> {
    return this.repository.findOne({
      select: this.select,
      where: this.uids.map((field) => {
        return {
          [field]: uid,
        };
      }),
    });
  }

  findByRememberMeToken(
    userId: string | number,
    token: string,
  ): Promise<UserEntity> {
    return this.repository.findOne({
      where: {
        id: userId,
        rememberMeToken: token,
      },
    });
  }

  updateRememberMeToken(user: UserEntity): Promise<any> {
    return this.repository.update(
      {
        id: user.id,
      },
      {
        rememberMeToken: 'NMEST',
      },
    );
  }
}
