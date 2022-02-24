import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async getByUsername(
    username,
    field: undefined | keyof UserEntity = 'email',
  ): Promise<UserEntity> {
    try {
      return await this.repository.findOneOrFail({
        where: {
          [field]: username,
        },
        select: ['email', 'password', 'id'],
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      return error;
    }
  }
}
