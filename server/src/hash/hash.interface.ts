export interface IHash {
  make(value: string): Promise<string>;
  verify(plainValue: string, hashedValue: string): Promise<boolean>;
}
