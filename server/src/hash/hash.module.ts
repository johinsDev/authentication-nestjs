import { Global, Module } from '@nestjs/common';
import { BcryptDriver } from './drivers/Bcrypt';
import { HashService } from './hash.service';

@Global()
@Module({
  providers: [
    HashService,
    {
      provide: 'DRIVER',
      useClass: BcryptDriver,
    },
  ],
  exports: [HashService],
})
export class HashModule {}
