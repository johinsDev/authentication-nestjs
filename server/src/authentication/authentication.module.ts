import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SessionGuard } from './guards/session.guard';
import { TypeORMUserProvider } from './user-providers/typeorm/typeorm-user.provider';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    UserRepository,
    {
      provide: 'USER_PROVIDER',
      useClass: TypeORMUserProvider,
    },
    {
      provide: 'GUARD',
      useClass: SessionGuard,
    },
  ],
})
export class AuthenticationModule {}
