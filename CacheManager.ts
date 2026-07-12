/**
 * A single cache entry.
 *
 * T is the type of the cached value.
 * expiresAt stores the absolute expiration time in milliseconds.
 */
type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

/**
 * AppCache is a plain cache service.
 *
 * It stores and retrieves values with expiration, but it does not manage its
 * own lifecycle.
 */
class AppCache {
  /**
   * The actual in-memory cache storage.
   *
   * The key is a string.
   * The value is a CacheEntry containing:
   * - the cached value
   * - the expiration timestamp
   */
  private readonly store = new Map<string, CacheEntry<unknown>>();

  public constructor() {}

  /**
   * Store a value in the cache.
   *
   * @param key - The unique key used to retrieve the value later.
   * @param value - The value to cache.
   * @param ttlSeconds - Time to live, in seconds.
   */
  public set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;

    this.store.set(key, {
      value,
      expiresAt,
    });
  }

  /**
   * Retrieve a value from the cache.
   *
   * If the key does not exist, return null.
   * If the key exists but has expired, delete it and return null.
   * Otherwise, return the cached value.
   */
  public get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Remove one item from the cache.
   */
  public delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear the entire cache.
   */
  public clear(): void {
    this.store.clear();
  }

  /**
   * Check whether a key currently exists and has not expired.
   */
  public has(key: string): boolean {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }
}

/**
 * AppCacheContext owns the shared cache lifecycle.
 *
 * The cache itself stays focused on cache behavior, while the context decides
 * how many cache instances the application should use.
 */
class AppCacheContext {
  private static instance: AppCacheContext | null = null;
  private constructor(private readonly cache: AppCache) {}

  public static getInstance(): AppCacheContext {
    if (AppCacheContext.instance === null) {
      AppCacheContext.instance = new AppCacheContext(new AppCache());
    }

    return AppCacheContext.instance;
  }

  public getCache(): AppCache {
    return this.cache;
  }
}

/**
 * Example data type used by UserService.
 */
type UserProfile = {
  id: string;
  name: string;
  email: string;
};

/**
 * A service that uses the shared Singleton cache.
 *
 * In a real application, this service might fetch user data from a database
 * or an external API. Here, we simulate that with a hard-coded object.
 */
class UserService {
  public constructor(private readonly cacheContext: AppCacheContext) {}

  public getUserProfile(userId: string): UserProfile {
    const cacheKey = `user-profile:${userId}`;

    const cachedProfile = this.cacheContext
      .getCache()
      .get<UserProfile>(cacheKey);

    if (cachedProfile) {
      console.log('Returning user profile from cache.');
      return cachedProfile;
    }

    console.log('Fetching user profile from database.');

    const profile: UserProfile = {
      id: userId,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    };

    // Cache the profile for 60 seconds.
    this.cacheContext.getCache().set(cacheKey, profile, 60);

    return profile;
  }
}

/**
 * Another service that uses the same shared Singleton cache.
 *
 * This demonstrates that UserService and PermissionService are not creating
 * separate cache objects. They both receive the same AppCache instance.
 */
class PermissionService {
  public constructor(private readonly cacheContext: AppCacheContext) {}

  public getUserPermissions(userId: string): string[] {
    const cacheKey = `user-permissions:${userId}`;

    const cachedPermissions = this.cacheContext
      .getCache()
      .get<string[]>(cacheKey);

    if (cachedPermissions) {
      console.log('Returning permissions from cache.');
      return cachedPermissions;
    }

    console.log('Fetching permissions from authorization service.');

    const permissions = ['READ_COURSES', 'EDIT_PROFILE'];

    // Cache the permissions for 30 seconds.
    this.cacheContext.getCache().set(cacheKey, permissions, 30);

    return permissions;
  }
}

/**
 * Client code.
 */
const cacheContext = AppCacheContext.getInstance();

const userService = new UserService(cacheContext);
const permissionService = new PermissionService(cacheContext);

const profile1 = userService.getUserProfile('u1');
const profile2 = userService.getUserProfile('u1');

const permissions1 = permissionService.getUserPermissions('u1');
const permissions2 = permissionService.getUserPermissions('u1');

console.log(profile1);
console.log(profile2);
console.log(permissions1);
console.log(permissions2);

/**
 * This proves both variables refer to the same Singleton context object,
 * which in turn shares one AppCache instance.
 */
const context1 = AppCacheContext.getInstance();
const context2 = AppCacheContext.getInstance();

console.log(context1 === context2); // true
console.log(context1.getCache() === context2.getCache()); // true
