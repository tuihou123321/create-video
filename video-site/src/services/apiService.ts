const PROXY_BASE_URL = 'http://localhost:3001/api';

export interface TTSResponse {
  output: {
    audio: {
      url: string;
    };
  };
}

export interface ASRTaskResponse {
  output: {
    task_id: string;
    task_status: string;
  };
}

export interface ASRResultResponse {
  output: {
    task_status: string;
    results: Array<{
      transcription_url: string;
    }>;
  };
}

export interface ImageGenerationResponse {
  output: {
    choices: Array<{
      message: {
        content: Array<{
          image: string;
        }>;
      };
    }>;
  };
}

export interface SubtitleSegment {
  text: string;
  start_time: number;
  end_time: number;
}

export interface GeneratedContent {
  audioUrl: string;
  subtitles: SubtitleSegment[];
  images: Array<{
    url: string;
    processedUrl?: string; // 添加抠图后的URL
    text: string;
    start_time: number;
  }>;
}

class APIService {
  private async makeRequest(url: string, options: RequestInit) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async textToSpeech(text: string, voice: string): Promise<string> {
    const response: TTSResponse = await this.makeRequest(
      `${PROXY_BASE_URL}/tts`,
      {
        method: 'POST',
        body: JSON.stringify({ text, voice }),
      }
    );

    return response.output.audio.url;
  }

  async startASRTask(audioUrl: string): Promise<string> {
    const response: ASRTaskResponse = await this.makeRequest(
      `${PROXY_BASE_URL}/asr/start`,
      {
        method: 'POST',
        body: JSON.stringify({ audioUrl }),
      }
    );

    return response.output.task_id;
  }

  async checkASRTask(taskId: string): Promise<ASRResultResponse> {
    return this.makeRequest(`${PROXY_BASE_URL}/asr/status/${taskId}`, {
      method: 'GET',
    });
  }

  async waitForASRCompletion(taskId: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const result = await this.checkASRTask(taskId);

      if (result.output.task_status === 'SUCCEEDED') {
        return result.output.results[0].transcription_url;
      }

      if (result.output.task_status === 'FAILED') {
        throw new Error('ASR task failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('ASR task timeout');
  }

  async fetchTranscription(transcriptionUrl: string): Promise<any> {
    const response = await this.makeRequest(
      `${PROXY_BASE_URL}/transcription?url=${encodeURIComponent(transcriptionUrl)}`,
      { method: 'GET' }
    );
    return response;
  }

  processTranscription(transcriptionData: any): SubtitleSegment[] {
    const words = transcriptionData.transcripts[0].sentences[0].words;
    const segments: SubtitleSegment[] = [];
    let currentSegment = '';
    let segmentStartTime = 0;
    let segmentEndTime = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      if (currentSegment === '') {
        segmentStartTime = word.begin_time;
      }

      currentSegment += word.text;
      segmentEndTime = word.end_time;

      if (word.punctuation === '，' || word.punctuation === '。' || i === words.length - 1) {
        segments.push({
          text: currentSegment,
          start_time: segmentStartTime / 1000,
          end_time: segmentEndTime / 1000,
        });
        currentSegment = '';
      }
    }

    return segments;
  }

  generateImagePrompt(text: string): string {
    const prompts: { [key: string]: string } = {
      '软柿子': '一个简洁的卡通风格插画，一只可爱的白色猫咪角色，手持大锤对着柿子，纯色背景或无背景，卡通风格，简洁线条',
      '狠角色': '一个简洁的卡通风格插画，一只可爱的白色猫咪角色，手持青色步枪，纯色背景或无背景，卡通风格，简洁线条',
      '听好了': '一个简洁的卡通风格插画，一只可爱的白色猫咪角色，举手做停止手势，纯色背景或无背景，卡通风格，简洁线条',
      '火': '一个简洁的卡通风格插画，一只可爱的白色猫咪角色，周围有火焰元素，纯色背景或无背景，卡通风格，简洁线条',
    };

    for (const [keyword, prompt] of Object.entries(prompts)) {
      if (text.includes(keyword)) {
        return prompt;
      }
    }

    return '一个简洁的卡通风格插画，一只可爱的白色猫咪角色，表情生动，纯色背景或无背景，卡通风格，简洁线条';
  }

  async generateImage(characterImage: string, prompt: string, model: string = 'doubao-seedream-4.0'): Promise<string> {
    const response: ImageGenerationResponse = await this.makeRequest(
      `${PROXY_BASE_URL}/image-generation`,
      {
        method: 'POST',
        body: JSON.stringify({ characterImage, prompt, model }),
      }
    );

    return response.output.choices[0].message.content[0].image;
  }
}

export const apiService = new APIService();