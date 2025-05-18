const { callSparkAPI } = require('./spark_api');
const db = require('./db');

async function getSemanticRecommendations(postId, limit = 5) {
  // 1. 获取当前文章摘要
  const [article] = await db.query('SELECT summary FROM articles WHERE id = ?', [postId]);
  if (!article) return [];

  // 2. 调用星火API获取相似文章ID
  const similarIds = await callSparkAPI(article.summary);
  if (!similarIds.length) return [];

  // 3. 查询数据库返回文章详情
  const articles = await db.query(
    `SELECT id, title, summary, url FROM articles WHERE id IN (?) LIMIT ?`, [similarIds, limit]
  );
  return articles;
}

module.exports = { getSemanticRecommendations }; 