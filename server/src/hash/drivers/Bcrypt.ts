import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IHash } from '../hash.interface';

@Injectable()
export class BcryptDriver implements IHash {
  make(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }

  verify(plainValue: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(plainValue, hashedValue);
  }
}
