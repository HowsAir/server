import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Redis from 'ioredis';
import { CacheService } from '../../src/services/cacheService';

// Mock Redis
vi.mock('ioredis');

describe('CacheService', () => {
    let cacheService: CacheService;
    let mockRedisInstance: {
        get: ReturnType<typeof vi.fn>;
        set: ReturnType<typeof vi.fn>;
        del: ReturnType<typeof vi.fn>;
        flushall: ReturnType<typeof vi.fn>;
        on: ReturnType<typeof vi.fn>;
    };

    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
    
    beforeEach(() => {
        // Create a mock Redis instance
        mockRedisInstance = {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
            flushall: vi.fn(),
            on: vi.fn(),
        };

        // Mock Redis constructor to return our mock instance
        (Redis as any).mockImplementation(() => mockRedisInstance);

        // Create a new CacheService with the mocked Redis
        cacheService = new CacheService({
            host: 'test-host',
            port: 6379,
            password: 'test-password',
        });

        // Mock console.log and console.error
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('get() method', () => {
        it('should return parsed data when key exists', async () => {
            const testKey = 'testKey';
            const testValue = { foo: 'bar' };

            mockRedisInstance.get.mockResolvedValue(JSON.stringify(testValue));

            const result = await cacheService.get(testKey);

            expect(mockRedisInstance.get).toHaveBeenCalledWith(testKey);
            expect(result).toEqual(testValue);
        });

        it('should return null when key does not exist', async () => {
            const testKey = 'nonExistentKey';

            mockRedisInstance.get.mockResolvedValue(null);

            const result = await cacheService.get(testKey);

            expect(result).toBeNull();
        });

        it('should handle parsing errors gracefully', async () => {
            const testKey = 'invalidKey';

            mockRedisInstance.get.mockRejectedValue('invalid json');

            const result = await cacheService.get(testKey);
            
            await expect(result).toBeNull();
        });
    });

    describe('set() method', () => {
        it('should set value with default TTL', async () => {
            const testKey = 'testKey';
            const testValue = { foo: 'bar' };

            await cacheService.set(testKey, testValue);

            expect(mockRedisInstance.set).toHaveBeenCalledWith(
                testKey,
                JSON.stringify(testValue),
                'EX',
                3600 // Default TTL
            );
        });

        it('should set value with custom TTL', async () => {
            const testKey = 'testKey';
            const testValue = { foo: 'bar' };
            const customTTL = 1000;

            await cacheService.set(testKey, testValue, customTTL);

            expect(mockRedisInstance.set).toHaveBeenCalledWith(
                testKey,
                JSON.stringify(testValue),
                'EX',
                customTTL
            );
        });
    });

    describe('delete() method', () => {
        it('should delete a key from cache', async () => {
            const testKey = 'testKey';

            await cacheService.delete(testKey);

            expect(mockRedisInstance.del).toHaveBeenCalledWith(testKey);
        });
    });

    describe('clear() method', () => {
        it('should clear entire cache', async () => {
            await cacheService.clear();

            expect(mockRedisInstance.flushall).toHaveBeenCalled();
        });
    });
});
