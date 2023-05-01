import Redis from "ioredis";
import { CacheConfig, CacheRecord, CacheSetOptions, ICache } from "./ICache";
/**
 * This is a redis implementation of the ICache interface.
 * With this wrapper you can make as many logical partitions of one single redis client.
 * Important to notice that in order to avoid key collisions, process.env.USERNAME and config.name are used as cache key prefixes to the argument key.
 */
export declare class RedisCacheRepository implements ICache<any> {
    private redis;
    private keyPrefix;
    private ttlInSeconds?;
    constructor(redis: Redis, config: CacheConfig);
    private _getKey;
    private _getSetExpiration;
    private _encode;
    private _decode;
    get(key: string): Promise<any | null>;
    getWithMeta(key: string): Promise<CacheRecord<any> | null>;
    set(key: string, value: any, options?: CacheSetOptions | undefined): Promise<boolean>;
    del(keys: string | string[]): Promise<number>;
    ttl(key: string): Promise<number>;
    expire(key: string, ttl: number): Promise<boolean>;
    has(key: string): Promise<any>;
    ping(): Promise<string | null>;
    keys(): Promise<string[]>;
    flushAll(): Promise<number>;
}
