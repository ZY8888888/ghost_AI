const db = require('./db'); // 你需要实现db.js用于数据库操作

async function getTagBasedRecommendations(postId, limit = 5) {
  // 1. 获取当前文章的标签
  const tags = await db.query(
    'SELECT tag_id FROM article_tags WHERE article_id = ?', [postId]
  );
  if (!tags.length) return [];

  // 2. 查找拥有相同标签的其他文章
  const tagIds = tags.map(t => t.tag_id);
  const articles = await db.query(
    `SELECT a.id, a.title, a.summary, a.url, a.views, a.created_at
     FROM articles a
     JOIN article_tags at ON a.id = at.article_id
     WHERE at.tag_id IN (?) AND a.id != ?
     GROUP BY a.id
     ORDER BY a.views DESC, a.created_at DESC
     LIMIT ?`, [tagIds, postId, limit]
  );
  return articles;
}

module.exports = { getTagBasedRecommendations }; 