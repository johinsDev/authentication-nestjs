import { randomBytes } from 'crypto';
import ms from 'ms';

/**
 * Normalizes base64 string by removing special chars and padding
 */
function normalizeBase64(value: string) {
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}

/**
 * Converts time expression to milliseconds
 */
export function toMs(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }

  return ms(value);
}

/**
 * Convert milliseconds to a human readable string
 */
export function prettyMs(value: number, options?: { long: boolean }): string {
  return ms(value, options);
}

/**
 * Generates a random string for a given size
 */
export function generateRandom(size: number) {
  const bits = (size + 1) * 6;
  const buffer = randomBytes(Math.ceil(bits / 8));
  return normalizeBase64(buffer.toString('base64')).slice(0, size);
}
