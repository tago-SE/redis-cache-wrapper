export function sayHello(name: string): string {
  return `Hello, ${name}!`;
}

export { ICache } from './ICache';
export { RedisCacheRepository } from './RedisCacheRepository';
