const Redis = require('ioredis');
const redis = new Redis(); // 默认本地6379端口

// 记录用户浏览历史
async function addUserHistory(userId, articleId) {
  await redis.zadd(`user:${userId}:history`, Date.now(), articleId);
}

// 获取用户浏览历史
async function getUserHistory(userId, limit = 20) {
  return await redis.zrevrange(`user:${userId}:history`, 0, limit - 1);
}

module.exports = { addUserHistory, getUserHistory }; 