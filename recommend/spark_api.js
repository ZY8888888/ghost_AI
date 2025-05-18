const axios = require('axios');

async function callSparkAPI(summary) {
  // 这里用伪API地址和参数，请替换为真实星火API
  const response = await axios.post('https://spark-api.example.com/similar', {
    summary
  });
  // 假设返回 { article_ids: [1,2,3] }
  return response.data.article_ids;
}

module.exports = { callSparkAPI }; 