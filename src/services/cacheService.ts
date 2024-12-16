/**
 * @file cacheService.ts
 * @description Provides a service for caching operations using Redis, including
 * methods for retrieving, storing, deleting, and clearing cached data.
 * This service is designed to abstract Redis interactions and provide error handling.
 * @author Juan Diaz
 */

import Redis from 'ioredis';
import 'dotenv/config';

/**
 * Interface defining the contract for caching operations.
 */
export interface ICacheService {
    /**
     * Retrieves a value from the cache for the given key.
     * @param key - The key to look up in the cache.
     * @returns A Promise resolving to the parsed value or null if the key doesn't exist.
     */
    get<T>(key: string): Promise<T | null>;

    /**
     * Stores a value in the cache with the specified key and optional TTL.
     * @param key - The key for storing the value.
     * @param value - The value to be stored (must be serializable).
     * @param ttl - Optional time-to-live in seconds. Defaults to 3600 seconds.
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;

    /**
     * Deletes a key-value pair from the cache.
     * @param key - The key to delete from the cache.
     */
    delete(key: string): Promise<void>;

    /**
     * Clears all keys from the cache.
     */
    clear(): Promise<void>;
}

/**
 * Service for interacting with a Redis cache.
 * Encapsulates operations such as getting, setting, deleting, and clearing cache data.
 */
export class CacheService implements ICacheService {
    private client: Redis; // Redis client instance
    private readonly DEFAULT_TTL = 3600; // Default time-to-live for cached items (in seconds)

    /**
     * Constructs a new CacheService instance.
     * Initializes a Redis connection using provided configuration or environment variables.
     * @param redisConfig - Optional Redis configuration object.
     */
    constructor(redisConfig?: {
        host?: string;
        port?: number;
        password?: string;
    }) {
        const {
            host = process.env.REDIS_HOST || 'localhost',
            port = parseInt(process.env.REDIS_PORT || '6379', 10),
            password = process.env.REDIS_PASSWORD,
        } = redisConfig || {};

        // Initialize Redis client with configuration
        this.client = new Redis({
            host,
            port,
            password: password || undefined,
        });

        // Setup error and connection event handling
        this.setupErrorHandling();
    }

    /**
     * Configures Redis client event listeners for logging connections and errors.
     * Ensures the client is monitored for unexpected issues.
     */
    private setupErrorHandling(): void {
        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });

        this.client.on('error', (err) => {
            console.error('Redis connection error:', err);
        });
    }

    /**
     * Retrieves data from the cache for a given key.
     * Automatically parses the JSON data before returning.
     * @param key - The cache key to retrieve.
     * @returns A Promise resolving to the parsed value or null if not found.
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this.logError('get', error);
            return null;
        }
    }

    /**
     * Stores a value in the cache for a specified key and optional TTL.
     * Automatically serializes the value to JSON.
     * @param key - The cache key.
     * @param value - The value to be cached.
     * @param ttl - Optional time-to-live in seconds (defaults to 3600 seconds).
     */
    async set<T>(
        key: string,
        value: T,
        ttl: number = this.DEFAULT_TTL
    ): Promise<void> {
        try {
            await this.client.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (error) {
            this.logError('set', error);
        }
    }

    /**
     * Deletes a specific key from the cache.
     * @param key - The cache key to delete.
     */
    async delete(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            this.logError('delete', error);
        }
    }

    /**
     * Clears all data from the cache.
     * Useful for resetting the cache during development or maintenance.
     */
    async clear(): Promise<void> {
        try {
            await this.client.flushall();
        } catch (error) {
            this.logError('clear', error);
        }
    }

    /**
     * Logs errors for debugging purposes, indicating the method where the error occurred.
     * @param method - The name of the method where the error occurred.
     * @param error - The error object or message.
     */
    private logError(method: string, error: unknown): void {
        console.error(`Error in CacheService.${method}:`, error);
    }

    /**
     * Exposes the underlying Redis client for advanced operations.
     * @returns The Redis client instance.
     */
    getClient(): Redis {
        return this.client;
    }
}

// Export a singleton instance of CacheService for use across the application.
export default new CacheService();
