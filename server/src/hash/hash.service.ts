import { Inject, Injectable } from '@nestjs/common';
import { IHash } from './hash.interface';

@Injectable()
export class HashService implements IHash {
  constructor(@Inject('DRIVER') private readonly driver: IHash) {}

  make(value: string): Promise<string> {
    return this.driver.make(value);
  }

  verify(plainValue: string, hashedValue: string): Promise<boolean> {
    return this.driver.verify(plainValue, hashedValue);
  }
}
