import { removeBackground } from "@imgly/background-removal";

export class ImageProcessor {
  private static instance: ImageProcessor;
  private isInitialized = false;
  private readonly REMOVE_BG_API_KEY = process.env.REACT_APP_REMOVE_BG_API_KEY || '';
  private readonly REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

  private constructor() {
    if (!this.REMOVE_BG_API_KEY) {
      console.warn('⚠️ 警告: 未找到REACT_APP_REMOVE_BG_API_KEY环境变量，remove.bg功能将不可用');
    }
  }

  static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
    }
    return ImageProcessor.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('初始化背景去除模型...');
      this.isInitialized = true;
    } catch (error) {
      console.error('背景去除模型初始化失败:', error);
      throw error;
    }
  }

  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async removeBackgroundWithRemoveBg(imageUrl: string): Promise<string> {
    try {
      if (!this.REMOVE_BG_API_KEY) {
        throw new Error('Remove.bg API密钥未配置，请设置REACT_APP_REMOVE_BG_API_KEY环境变量');
      }

      console.log('使用remove.bg API处理图片背景去除:', imageUrl);

      const formData = new FormData();
      formData.append('image_url', imageUrl);
      formData.append('size', 'auto');

      const response = await fetch(this.REMOVE_BG_API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`remove.bg API request failed: ${response.status}`);
      }

      const blob = await response.blob();
      const dataUrl = await this.blobToDataUrl(blob);

      console.log('remove.bg API背景去除完成');
      return dataUrl;
    } catch (error) {
      console.error('remove.bg API背景去除失败:', error);
      return imageUrl;
    }
  }

  async removeBackgroundFromUrl(imageUrl: string): Promise<string> {
    try {
      console.log('开始处理图片背景去除:', imageUrl);

      const blob = await removeBackground(imageUrl);
      const dataUrl = await this.blobToDataUrl(blob);

      console.log('背景去除完成');
      return dataUrl;
    } catch (error) {
      console.error('背景去除失败:', error);
      return imageUrl;
    }
  }

  cleanup(): void {
    // DataURL不需要手动释放
  }
}

export const imageProcessor = ImageProcessor.getInstance();
