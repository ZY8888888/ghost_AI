const Redis = require('ioredis');

// 创建 Redis 客户端实例
const redis = new Redis({
    port: 6379,          // Redis 端口
    host: '127.0.0.1',   // Redis 主机
    family: 4,           // 4 (IPv4) 或 6 (IPv6)
    password: '',        // 如果有密码，请设置
    db: 0               // 使用的数据库索引
});

// 错误处理
redis.on('error', (err) => {
    console.error('Redis Error:', err);
});

// 连接成功
redis.on('connect', () => {
    console.log('Redis connected successfully');
});

// 缓存键前缀
const CACHE_PREFIX = 'ghost:';
const DEFAULT_CACHE_TIME = 60 * 60; // 1小时

// 缓存中间件
const cacheMiddleware = async (req, res, next) => {
    // 只缓存 GET 请求
    if (req.method !== 'GET') {
        return next();
    }

    const cacheKey = CACHE_PREFIX + req.originalUrl;

    try {
        // 尝试从缓存获取数据
        const cachedData = await redis.get(cacheKey);
        
        if (cachedData) {
            console.log(`Cache hit for ${req.originalUrl}`);
            return res.json(JSON.parse(cachedData));
        }

        // 如果没有缓存，修改 res.json 方法来缓存响应
        const originalJson = res.json;
        res.json = function(data) {
            // 缓存响应数据
            redis.setex(cacheKey, DEFAULT_CACHE_TIME, JSON.stringify(data))
                .catch(err => console.error('Redis cache error:', err));
            
            // 调用原始的 json 方法
            return originalJson.call(this, data);
        };

        next();
    } catch (error) {
        console.error('Redis middleware error:', error);
        next();
    }
};

// 清除缓存的方法
const clearCache = async (pattern = CACHE_PREFIX + '*') => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
            console.log(`Cleared ${keys.length} cache entries`);
        }
    } catch (error) {
        console.error('Cache clear error:', error);
    }
};

// 为特定路由缓存数据的方法
const cacheData = async (key, data, expireTime = DEFAULT_CACHE_TIME) => {
    const cacheKey = CACHE_PREFIX + key;
    try {
        await redis.setex(cacheKey, expireTime, JSON.stringify(data));
        console.log(`Cached data for key: ${key}`);
    } catch (error) {
        console.error('Cache set error:', error);
    }
};

// 获取缓存数据的方法
const getCachedData = async (key) => {
    const cacheKey = CACHE_PREFIX + key;
    try {
        const data = await redis.get(cacheKey);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
};

module.exports = {
    redis,
    cacheMiddleware,
    clearCache,
    cacheData,
    getCachedData
}; 