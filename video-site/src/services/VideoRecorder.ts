import { GenerationConfig } from '../generator/ConfigPage';
import { GeneratedContent } from '../generator/VideoPlayer';

export class VideoRecorder {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private audioContext: AudioContext;
    private dest: MediaStreamAudioDestinationNode;
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];
    private images: Map<string, HTMLImageElement> = new Map();
    private config: GenerationConfig;
    private content: GeneratedContent;
    private width = 1920;
    private height = 1080;
    private fps = 30;

    constructor(config: GenerationConfig, content: GeneratedContent) {
        this.config = config;
        this.content = content;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d')!;

        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.dest = this.audioContext.createMediaStreamDestination();
    }

    private async loadImage(url: string): Promise<HTMLImageElement> {
        if (this.images.has(url)) return this.images.get(url)!;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.images.set(url, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    private async preloadResources() {
        const promises: Promise<any>[] = [];

        // Preload background
        if (this.config.backgroundImage) {
            promises.push(this.loadImage(this.config.backgroundImage));
        }

        // Preload character images
        this.content.images.forEach(img => {
            const url = img.processedUrl || img.url;
            if (url) promises.push(this.loadImage(url));
        });

        await Promise.all(promises);
    }

    private drawFrame(currentTime: number) {
        const { ctx, width, height, config, content } = this;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Background
        if (config.backgroundImage && this.images.has(config.backgroundImage)) {
            const bgImg = this.images.get(config.backgroundImage)!;
            // Object-fit: cover simulation
            const scale = Math.max(width / bgImg.width, height / bgImg.height);
            const x = (width - bgImg.width * scale) / 2;
            const y = (height - bgImg.height * scale) / 2;
            ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
        } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Draw Watermark
        if (config.watermarkText) {
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.font = 'bold 280px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'; // 15vw approx
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.filter = 'blur(4px)';
            ctx.fillText(config.watermarkText, 0, 0);
            ctx.restore();
        }

        // 3. Draw Header
        ctx.save();
        ctx.font = '500 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        if (config.headerLeftText) {
            ctx.textAlign = 'left';
            ctx.fillText(config.headerLeftText, 40, 60);
        }

        if (config.headerRightText) {
            ctx.textAlign = 'right';
            ctx.fillText(config.headerRightText, width - 40, 60);
        }
        ctx.restore();

        // 4. Draw Character
        const activeImage = content.images.find(
            img => currentTime >= img.start_time && currentTime < img.start_time + 3.5
        );

        if (activeImage) {
            const url = activeImage.processedUrl || activeImage.url;
            if (this.images.has(url)) {
                const charImg = this.images.get(url)!;
                const timeSinceStart = currentTime - activeImage.start_time;

                // Animation: 70vh -> 50vh in 0.1s (approx)
                // In VideoPlayer.tsx: setImageScale(70); setTimeout(() => setImageScale(50), 100);
                // We simulate this transition
                let scaleVh = 50;
                if (timeSinceStart < 0.1) {
                    // Linear interpolation from 70 to 50
                    scaleVh = 70 - (timeSinceStart / 0.1) * 20;
                }

                const imgHeight = (height * scaleVh) / 100;
                const scale = imgHeight / charImg.height;
                const imgWidth = charImg.width * scale;

                ctx.save();
                ctx.translate(width / 2, height / 2);

                // Apply styles based on background removal mode
                // Note: Canvas doesn't support all CSS mix-blend-modes perfectly or filters in the same way
                // We approximate
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 30;
                ctx.shadowOffsetY = 10;

                if (config.imageBackgroundRemoval === 'css-blend') {
                    ctx.globalCompositeOperation = 'screen';
                    ctx.filter = 'contrast(1.2) brightness(1.1)';
                } else if (config.imageBackgroundRemoval === 'checkerboard-remove') {
                    ctx.globalCompositeOperation = 'darken';
                    ctx.filter = 'contrast(1.3) brightness(1.2)';
                }

                ctx.drawImage(charImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
                ctx.restore();
            }
        }

        // 5. Draw Subtitle
        const activeSubtitle = content.subtitles.find(
            sub => currentTime >= sub.start_time && currentTime <= sub.end_time
        );

        if (activeSubtitle) {
            ctx.save();
            const fontSize = (config.subtitleFontSize || 4) * 16 * 2; // Scale up for 1080p (approx 2x)
            ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            // Measure text for background
            const textMetrics = ctx.measureText(activeSubtitle.text);
            const textWidth = textMetrics.width;
            const textHeight = fontSize * 1.2;
            const paddingX = 50;
            const paddingY = 20;
            const bgWidth = textWidth + paddingX * 2;
            const bgHeight = textHeight + paddingY; // approximate

            const x = width / 2;
            const y = height * 0.85; // bottom 15%

            // Draw background
            ctx.fillStyle = `rgba(0, 0, 0, ${config.subtitleBackgroundOpacity || 0.7})`;

            // Rounded rectangle
            const r = 15;
            ctx.beginPath();
            ctx.roundRect(x - bgWidth / 2, y - textHeight, bgWidth, bgHeight);
            ctx.fill();

            // Draw text
            ctx.fillStyle = config.subtitleColor || '#ffffff';
            // Text shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;

            ctx.fillText(activeSubtitle.text, x, y + paddingY / 2); // Adjust baseline

            ctx.restore();
        }
    }

    private async prepareAudio(): Promise<{ ttsSource: AudioBufferSourceNode, bgmSource: AudioBufferSourceNode, duration: number }> {
        // Load TTS Audio (via proxy to avoid CORS)
        const proxyUrl = `http://localhost:3001/api/proxy-audio?url=${encodeURIComponent(this.content.audioUrl)}`;
        const ttsResponse = await fetch(proxyUrl);
        const ttsArrayBuffer = await ttsResponse.arrayBuffer();
        const ttsAudioBuffer = await this.audioContext.decodeAudioData(ttsArrayBuffer);

        // Load BGM Audio
        const bgmUrl = this.config.backgroundMusic || "/static/bg-music.mp3";
        const bgmResponse = await fetch(bgmUrl);
        const bgmArrayBuffer = await bgmResponse.arrayBuffer();
        const bgmAudioBuffer = await this.audioContext.decodeAudioData(bgmArrayBuffer);

        const ttsSource = this.audioContext.createBufferSource();
        ttsSource.buffer = ttsAudioBuffer;

        const bgmSource = this.audioContext.createBufferSource();
        bgmSource.buffer = bgmAudioBuffer;
        bgmSource.loop = true;

        // Gain nodes for volume control
        const ttsGain = this.audioContext.createGain();
        ttsGain.gain.value = 1.0;

        const bgmGain = this.audioContext.createGain();
        bgmGain.gain.value = this.config.musicVolume;

        // Connect graph
        ttsSource.connect(ttsGain);
        ttsGain.connect(this.dest);

        bgmSource.connect(bgmGain);
        bgmGain.connect(this.dest);

        // Connect to speakers as well so user can hear it while recording (optional, maybe mute to avoid echo if they are playing video too?)
        // Better NOT to connect to destination (speakers) if we want silent recording or if we don't want double audio.
        // But user might want to hear progress. Let's keep it silent or maybe just let the UI show progress.
        // Actually, if we don't connect to context.destination, we won't hear it.
        // Let's NOT connect to speakers to avoid feedback/noise, user sees progress bar.

        return { ttsSource, bgmSource, duration: ttsAudioBuffer.duration };
    }

    public async startRecording(onProgress: (progress: number) => void): Promise<Blob> {
        await this.preloadResources();

        // Draw initial frame to ensure canvas has content
        this.drawFrame(0);

        const { ttsSource, bgmSource, duration } = await this.prepareAudio();

        const canvasStream = this.canvas.captureStream(this.fps);
        const audioStream = this.dest.stream;

        // Combine tracks explicitly to ensure both video and audio are present
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // Detect supported mimeType
        const mimeTypes = [
            'video/mp4;codecs=avc1,mp4a.40.2',
            'video/mp4',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm;codecs=h264',
            'video/webm'
        ];

        let selectedMimeType = '';
        for (const type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                selectedMimeType = type;
                break;
            }
        }

        // Fallback if nothing matched (unlikely)
        if (!selectedMimeType) {
            selectedMimeType = 'video/webm';
        }

        console.log('Using mimeType:', selectedMimeType);

        this.mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: selectedMimeType
        });

        this.recordedChunks = [];
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.recordedChunks.push(e.data);
            }
        };

        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) return reject('No media recorder');

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: selectedMimeType });
                resolve(blob);
            };

            this.mediaRecorder.start();
            ttsSource.start(0);
            bgmSource.start(0);

            const startTime = this.audioContext.currentTime;
            let animationFrameId: number;

            const renderLoop = () => {
                const currentTime = this.audioContext.currentTime - startTime;

                if (currentTime >= duration) {
                    // Stop recording
                    this.mediaRecorder?.stop();
                    ttsSource.stop();
                    bgmSource.stop();
                    cancelAnimationFrame(animationFrameId);
                    onProgress(100);
                } else {
                    this.drawFrame(currentTime);
                    onProgress((currentTime / duration) * 100);
                    animationFrameId = requestAnimationFrame(renderLoop);
                }
            };

            renderLoop();
        });
    }
}
