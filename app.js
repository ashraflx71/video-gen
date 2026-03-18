// التطبيق الرئيسي
class VideoGeneratorApp {
    constructor() {
        this.canvasEditor = null;
        this.videoGenerator = null;
        this.currentVideo = null;
        this.init();
    }

    async init() {
        // تهيئة المكونات
        this.canvasEditor = new CanvasEditor('previewCanvas');
        this.videoGenerator = new VideoGenerator();
        
        // إعداد المستمعات
        this.setupEventListeners();
        
        // تحديث المعاينة الأولية
        this.updatePreview();
        
        // تسجيل Service Worker لـ PWA
        this.registerServiceWorker();
        
        // التحقق من إمكانية التثبيت
        this.setupInstallPrompt();
    }

    setupEventListeners() {
        // أزرار التحكم
        document.getElementById('generateBtn').addEventListener('click', () => this.generateVideo());
        document.getElementById('previewBtn').addEventListener('click', () => this.updatePreview());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadVideo());

        // تحديث المعاينة عند تغيير الإعدادات
        const inputs = ['videoWidth', 'videoHeight', 'textInput', 'fontSize', 
                       'textColor', 'bgColor', 'animationType', 'fps', 'duration'];
        
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updatePreview());
        });
    }

    updatePreview() {
        // الحصول على القيم
        const config = this.getConfig();
        
        // تحديث أبعاد الكانفاس
        this.canvasEditor.resize(config.width, config.height);
        
        // معاينة أول إطار
        this.canvasEditor.previewFrame(0, config);
    }

    getConfig() {
        return {
            width: parseInt(document.getElementById('videoWidth').value) || 1280,
            height: parseInt(document.getElementById('videoHeight').value) || 720,
            text: document.getElementById('textInput').value || 'مرحباً بكم',
            fontSize: parseInt(document.getElementById('fontSize').value) || 48,
            textColor: document.getElementById('textColor').value,
            bgColor: document.getElementById('bgColor').value,
            animationType: document.getElementById('animationType').value,
            fps: parseInt(document.getElementById('fps').value) || 30,
            duration: parseInt(document.getElementById('duration').value) || 5
        };
    }

    async generateVideo() {
        try {
            // تعطيل أزرار التحكم أثناء التوليد
            this.setButtonsState(true);
            
            // الحصول على الإعدادات
            const config = this.getConfig();
            
            // توليد الإطارات
            const frames = this.canvasEditor.generateFrames(config);
            
            // تصدير الفيديو
            const video = await this.videoGenerator.exportVideo(frames, config);
            
            // حفظ الفيديو الحالي
            this.currentVideo = video;
            
            // تفعيل زر التحميل
            document.getElementById('downloadBtn').disabled = false;
            
            // إظهار رسالة نجاح
            alert('✅ تم إنشاء الفيديو بنجاح!');
            
        } catch (error) {
            console.error('خطأ في إنشاء الفيديو:', error);
            alert('❌ حدث خطأ في إنشاء الفيديو');
        } finally {
            this.setButtonsState(false);
        }
    }

    downloadVideo() {
        if (this.currentVideo) {
            this.videoGenerator.downloadVideo(
                this.currentVideo.url, 
                `video-${Date.now()}.webm`
            );
        }
    }

    setButtonsState(disabled) {
        document.getElementById('generateBtn').disabled = disabled;
        document.getElementById('previewBtn').disabled = disabled;
        document.getElementById('downloadBtn').disabled = disabled;
    }

    // PWA: تسجيل Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registered:', registration);
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed:', error);
                    });
            });
        }
    }

    // PWA: إعداد زر التثبيت
    setupInstallPrompt() {
        let deferredPrompt;
        const installBtn = document.getElementById('installBtn');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.style.display = 'block';

            installBtn.addEventListener('click', () => {
                installBtn.style.display = 'none';
                deferredPrompt.prompt();
                
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                });
            });
        });
    }
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new VideoGeneratorApp();
});
