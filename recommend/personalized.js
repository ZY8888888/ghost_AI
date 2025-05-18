const { getUserHistory } = require('./redis_client');
const db = require('./db');

async function getPersonalizedRecommendations(userId, limit = 5) {
  // 1. 获取用户历史
  const history = await getUserHistory(userId, 50);
  if (!history.length) return [];

  // 2. 统计用户偏好标签
  const tagRows = await db.query(
    `SELECT tag_id FROM article_tags WHERE article_id IN (?)`, [history]
  );
  const tagCount = {};
  tagRows.forEach(row => {
    tagCount[row.tag_id] = (tagCount[row.tag_id] || 0) + 1;
  });
  const favTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tagId]) => tagId);

  // 3. 推荐用户偏好标签下的热门文章
  const articles = await db.query(
    `SELECT a.id, a.title, a.summary, a.url, a.views
     FROM articles a
     JOIN article_tags at ON a.id = at.article_id
     WHERE at.tag_id IN (?) AND a.id NOT IN (?)
     ORDER BY a.views DESC
     LIMIT ?`, [favTags, history, limit]
  );
  return articles;
}

module.exports = { getPersonalizedRecommendations }; 