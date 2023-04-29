
export interface CacheConfig {
  /**
   * The name of the cache repository will be used to determine the key prefix
   */
  name: string;
  
  /**
   * Character used to separate key segments, defaults to ':'.
   */
  separator?: string;

  /**
   * Time to live in number of seconds
   */
  ttlInSeconds?: number;
}


export interface CacheSetOptions {
  ttlInSeconds?: number;
}

export interface ICache<T> {
  /**
   * Changes the expiration time of the key. Returns true if successful otherwise false.
   * Passing a negative ttl value will persist it forever, 0 is the same as performing a delete.
   *
   * @param key
   * @param ttl
   */
  expire(key: string, ttl: number): Promise<boolean>;
  /**
   * Returns cached value or null.
   */
  get(key: string): Promise<T | null>;

  getWithMeta(key: string): Promise<CacheRecord<T> | null>;

  /**
   * Update the cached value. Returns true if successful.
   * @param key
   * @param value
   * @param options { ttl }
   */
  set(key: string, value: T, options?: CacheSetOptions): Promise<boolean>;

  /**
   * Delete cached value(s).
   * Returns 1 if at least one cached value was removed, 0 if nothing was removed.
   */
  del(key: string): Promise<number>;

  /**
   * Returns the expiration time in seconds. TTL <= 0 should be considered as expired.
   * -1, if the key does not have expiry timeout. -2, if the key does not exist.
   */
  ttl(key: string): Promise<number>;

  /**
   * Returns true if the cached value exists.
   */
  has(key: string): Promise<boolean>;

  /**
   * Health check the cache server.
   * Returns "PONG" if the remote cache is reachable.
   */
  ping(): Promise<string | null>;

  /**
   * Query all cache keys belonging to this repository.
   */
  keys(): Promise<string[]>;

  /**
   * Removes all cached values associated with this repository.
   */
  flushAll(): Promise<number>;
}

export interface CacheRecord<T> {
  value: T;
  meta: CacheRecordMeta;
}

export interface CacheRecordMeta {
  savedAt: number;
  ttl: number | undefined;
  rawKey: string;
  argKey: string;
}