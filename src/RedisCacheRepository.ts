import Redis from "ioredis";
import { CacheConfig, CacheRecord, CacheRecordMeta as CacheRecordMetadata, CacheSetOptions, ICache } from "./ICache";

/**
 * This is a redis implementation of the ICache interface. 
 * With this wrapper you can make as many logical partitions of one single redis client.
 * Important to notice that in order to avoid key collisions, process.env.USERNAME and config.name are used as cache key prefixes to the argument key.
 */
export class RedisCacheRepository implements ICache<any> {
  private redis: any;
  private keyPrefix: string;
  private ttlInSeconds?: number;

  constructor(redis: Redis, config: CacheConfig) {
    const keySeparator = config.separator || ":";
    const userSegment = process.env.USERNAME
      ? process.env.USERNAME + keySeparator
      : "";
    const nameSegment = config.name + keySeparator;
    this.ttlInSeconds = config.ttlInSeconds;
    this.keyPrefix = userSegment + nameSegment;
    this.redis = redis;
  }

  private _getKey(key: string): string {
    return this.keyPrefix + key;
  }

  private _getSetExpiration(options: CacheSetOptions = {}) {
    const ttl =
      typeof options?.ttlInSeconds === "number"
        ? options.ttlInSeconds
        : this.ttlInSeconds ?? 0;
    return isNaN(ttl) ? 0 : ttl;
  }

  private _encode(value: any, meta: CacheRecordMetadata): string {
    if (!value) throw new Error("Value must be set.");
    const encoded: CacheRecord<any> = { value, meta };
    return JSON.stringify(encoded);
  }

  private _decode(value: string | null): CacheRecord<any> | null {
    if (!value) return null;
    const decoded: CacheRecord<any> = JSON.parse(value);
    return decoded;
  }

  public async get(key: string): Promise<any | null> {
    const data = await this.redis
      .get(this._getKey(key))
      .then((value: any) => this._decode(value));
    return data?.value || null;
  }

  public async getWithMeta(key: string): Promise<CacheRecord<any> | null> {
    return await this.redis
      .get(this._getKey(key))
      .then((value: any) => this._decode(value));
  }

  public async set(
    key: string,
    value: any,
    options?: CacheSetOptions | undefined
  ): Promise<boolean> {
    const ttl = this._getSetExpiration(options);
    const _key = this._getKey(key);
    const meta: CacheRecordMetadata = {
      argKey: key,
      rawKey: _key,
      ttl,
      savedAt: Date.now(),
    };
    const result =
      ttl > 0
        ? await this.redis.set(_key, this._encode(value, meta), "EX", ttl)
        : await this.redis.set(_key, this._encode(value, meta));
    return result === "OK";
  }

  public async del(keys: string | string[]): Promise<number> {
    if (Array.isArray(keys)) {
      const _keys = keys.map((key) => this._getKey(key));
      return await this.redis.del(_keys);
    }
    return await this.redis.del(this._getKey(keys));
  }

  public async ttl(key: string): Promise<number> {
    return await this.redis.ttl(this._getKey(key));
  }

  public async expire(key: string, ttl: number): Promise<boolean> {
    const _key = this._getKey(key);
    if (ttl < 0) return (await this.redis.persist(_key)) === 1;
    return (await this.redis.expire(_key, ttl)) === 1;
  }

  public async has(key: string): Promise<any> {
    return (await this.redis.exists(this._getKey(key))) === 1;
  }

  public async ping(): Promise<string | null> {
    return await this.redis.ping();
  }

  public async keys(): Promise<string[]> {
    const firstPartOfKey = this._getKey("");
    const keys = await this.redis.keys(firstPartOfKey + "*");
    return keys.map((key: string) => key.replace(firstPartOfKey, ""));
  }

  public async flushAll(): Promise<number> {
    const keys = await this.redis.keys(this._getKey("") + "*");
    return keys.length <= 0 ? 0 : await this.redis.del(keys);
  }
}