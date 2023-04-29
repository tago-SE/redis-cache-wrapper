export function sayHello(name: string): string {
  return `Hello, ${name}!`;
}

export { ICache } from './src/ICache';
export { RedisCacheRepository  } from "./src/RedisCacheRepository";