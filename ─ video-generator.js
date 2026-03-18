class VideoGenerator {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.canvasStream = null;
    }

    // تحويل الإطارات إلى فيديو
    async framesToVideo(frames, fps = 30) {
        return new Promise(async (resolve, reject) => {
            try {
                // إنشاء عنصر canvas للتسجيل
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // تحميل أول إطار لمعرفة الأبعاد
                const firstFrame = await this.loadImage(frames[0]);
                canvas.width = firstFrame.width;
                canvas.height = firstFrame.height;

                // إنشاء MediaStream من canvas
                this.stream = canvas.captureStream(fps);
                
                // إعداد MediaRecorder
                this.mediaRecorder = new MediaRecorder(this.stream, {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: 5000000 // 5 Mbps
                });

                this.recordedChunks = [];

                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.recordedChunks.push(event.data);
                    }
                };

                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.recordedChunks, {
                        type: 'video/webm'
                    });
                    
                    // تحويل إلى MP4 (اختياري)
                    this.convertToMP4(blob).then(resolve).catch(reject);
                };

                // بدء التسجيل
                this.mediaRecorder.start();

                // رسم الإطارات على canvas
                for (let i = 0; i < frames.length; i++) {
                    const img = await this.loadImage(frames[i]);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // انتظار الوقت المناسب للإطار التالي
                    await this.sleep(1000 / fps);
                }

                // إيقاف التسجيل بعد الانتهاء
                this.mediaRecorder.stop();
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // تحميل الصورة
    loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

    // تأخير
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // تحويل WebM إلى MP4 (محاكاة - في الواقع تحتاج مكتبة خارجية)
    async convertToMP4(webmBlob) {
        // في التطبيق الحقيقي، يمكنك استخدام ffmpeg.wasm
        // هذا مجرد محاكاة
        
        // إنشاء رابط للتحميل بصيغة webm
        const url = URL.createObjectURL(webmBlob);
        
        // إنشاء عنصر فيديو للمعاينة
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        
        return {
            blob: webmBlob,
            url: url,
            type: 'video/webm'
        };
    }

    // تصدير الفيديو
    async exportVideo(frames, config) {
        const { fps, duration } = config;
        
        // تحديث شريط التقدم
        this.updateProgress(0);

        // إنشاء الفيديو
        const result = await this.framesToVideo(frames, fps);
        
        this.updateProgress(100);
        
        return result;
    }

    // تحديث شريط التقدم
    updateProgress(percent) {
        const progressContainer = document.querySelector('.progress-container');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        if (progressContainer) {
            progressContainer.style.display = 'block';
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `${Math.round(percent)}%`;
        }
    }

    // تحميل الفيديو
    downloadVideo(videoUrl, filename = 'video.webm') {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
