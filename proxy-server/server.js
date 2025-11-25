const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.DASHSCOPE_API_KEY;

// 检查必要的环境变量
if (!API_KEY) {
  console.error('❌ 错误: 未找到DASHSCOPE_API_KEY环境变量');
  console.log('请创建.env文件并设置DASHSCOPE_API_KEY');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// 通用API代理函数
const makeAPIRequest = async (url, data, headers = {}) => {
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Request failed:', error.message);
    throw error;
  }
};

// 文本转语音API
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;

    const data = {
      model: 'qwen3-tts-flash',
      input: {
        text,
        voice,
        language_type: 'Chinese',
      },
    };

    const result = await makeAPIRequest(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      data
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Evolink Image Generation API
app.post('/api/image-generation', async (req, res) => {
  try {
    const { characterImage, prompt, model = 'doubao-seedream-4.0' } = req.body;
    const evolinkApiKey = process.env.EVOLINK_API_KEY;

    if (!evolinkApiKey) {
      throw new Error('EVOLINK_API_KEY not found');
    }

    // 1. Create generation task
    const createResponse = await axios.post(
      'https://api.evolink.ai/v1/images/generations',
      {
        model,
        prompt,
        n: 1,
        size: '1024x1024'
      },
      {
        headers: {
          'Authorization': `Bearer ${evolinkApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const taskId = createResponse.data.id;
    console.log(`Task created: ${taskId} (Model: ${model})`);

    // 2. Poll for results
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const checkResponse = await axios.get(
        `https://api.evolink.ai/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${evolinkApiKey}`
          }
        }
      );

      const taskStatus = checkResponse.data.status;

      if (taskStatus === 'completed') {
        // Return in the format expected by the frontend
        // The frontend expects: response.output.choices[0].message.content[0].image
        // Evolink returns: results: ["url"]
        const imageUrl = checkResponse.data.results[0];

        // Adapt to the existing frontend response structure to minimize frontend changes
        // or we can update frontend to handle this. 
        // Let's adapt it here to match the structure expected by apiService.ts
        // apiService expects: output.choices[0].message.content[0].image

        const adaptedResponse = {
          output: {
            choices: [{
              message: {
                content: [{
                  image: imageUrl
                }]
              }
            }]
          }
        };

        return res.json(adaptedResponse);
      }

      if (taskStatus === 'failed') {
        throw new Error('Image generation task failed');
      }

      attempts++;
    }

    throw new Error('Image generation timeout');

  } catch (error) {
    console.error('Image generation error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// ASR音频转字幕API - 启动任务
app.post('/api/asr/start', async (req, res) => {
  try {
    const { audioUrl } = req.body;

    const data = {
      model: 'paraformer-v2',
      input: {
        file_urls: [audioUrl],
      },
      parameters: {
        channel_id: [0],
        language_hints: ['zh'],
        timestamp_alignment_enabled: true,
      },
    };

    const result = await makeAPIRequest(
      'https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription',
      data,
      { 'X-DashScope-Async': 'enable' }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ASR任务状态查询
app.get('/api/asr/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const response = await axios.get(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取转录文件内容
app.get('/api/transcription', async (req, res) => {
  try {
    const { url } = req.query;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 代理音频文件下载 (解决CORS问题)
app.get('/api/proxy-audio', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });

    // Forward content type
    res.set('Content-Type', response.headers['content-type']);

    // Pipe the stream
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy audio failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});