const express = require('express');
const router = express.Router();
const { getTagBasedRecommendations } = require('./tag_based');
const { getSemanticRecommendations } = require('./semantic_ai');
const { getPersonalizedRecommendations } = require('./personalized');

// 标签协同推荐
router.get('/recommend/tag/:postId', async (req, res) => {
  const result = await getTagBasedRecommendations(req.params.postId);
  res.json(result);
});

// AI语义推荐
router.get('/recommend/semantic/:postId', async (req, res) => {
  const result = await getSemanticRecommendations(req.params.postId);
  res.json(result);
});

// 个性化推荐
router.get('/recommend/personalized/:userId', async (req, res) => {
  const result = await getPersonalizedRecommendations(req.params.userId);
  res.json(result);
});

module.exports = router; 