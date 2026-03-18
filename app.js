// التطبيق الرئيسي// في بداية كلاس VideoGeneratorApp
constructor() {
    this.canvasEditor = null;
    this.videoGenerator = null;
    this.youtubeDownloader = null; // إضافة هذا السطر
    this.currentVideo = null;
    this.isGenerating = false;
    this.init();
}
class VideoGeneratorApp {
    constructor() {
        this.canvasEditor = null;
        this.videoGenerator = null;
        this.currentVideo = null;
        this.isGenerating = false;
        this.init();
    }

    async init() {
        try {
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
            
            console.log('✅ التطبيق initialized بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تهيئة التطبيق:', error);
            alert('حدث خطأ في تهيئة التطبيق. تأكد من وجود جميع الملفات.');
        }
    }

    setupEventListeners() {
        // أزرار التحكم الرئيسية
        const generateBtn = document.getElementById('generateBtn');
        const previewBtn = document.getElementById('previewBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateVideo());
        } else {
            console.warn('⚠️ زر إنشاء الفيديو غير موجود');
        }
        
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.updatePreview());
        } else {
            console.warn('⚠️ زر المعاينة غير موجود');
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadVideo());
        } else {
            console.warn('⚠️ زر التحميل غير موجود');
        }

        // تحديث المعاينة عند تغيير الإعدادات (مع تحسين الأداء)
        const inputs = ['videoWidth', 'videoHeight', 'textInput', 'fontSize', 
                       'textColor', 'bgColor', 'animationType', 'fps', 'duration'];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    // تحديث أبعاد الكانفاس أولاً
                    this.updateCanvasDimensions();
                    // ثم تحديث المعاينة
                    this.updatePreview();
                });
            } else {
                console.warn(`⚠️ العنصر ${id} غير موجود`);
            }
        });

        // إضافة مستمع لتغيير أبعاد الفيديو
        const widthInput = document.getElementById('videoWidth');
        const heightInput = document.getElementById('videoHeight');
        
        if (widthInput && heightInput) {
            widthInput.addEventListener('change', () => this.updateCanvasDimensions());
            heightInput.addEventListener('change', () => this.updateCanvasDimensions());
        }
    }

    updateCanvasDimensions() {
        const width = parseInt(document.getElementById('videoWidth')?.value) || 1280;
        const height = parseInt(document.getElementById('videoHeight')?.value) || 720;
        
        if (this.canvasEditor) {
            this.canvasEditor.resize(width, height);
        }
    }

    updatePreview() {
        try {
            // التأكد من وجود canvasEditor
            if (!this.canvasEditor) {
                console.error('❌ canvasEditor غير مهيأ');
                return;
            }

            // الحصول على القيم
            const config = this.getConfig();
            
            // التحقق من صحة القيم
            if (!config.text) {
                config.text = 'مرحباً بكم'; // نص افتراضي
            }
            
            // معاينة أول إطار
            this.canvasEditor.previewFrame(0, config);
            
            console.log('👁️ تم تحديث المعاينة:', config);
        } catch (error) {
            console.error('❌ خطأ في تحديث المعاينة:', error);
        }
    }

    getConfig() {
        return {
            width: parseInt(document.getElementById('videoWidth')?.value) || 1280,
            height: parseInt(document.getElementById('videoHeight')?.value) || 720,
            text: document.getElementById('textInput')?.value || 'مرحباً بكم',
            fontSize: parseInt(document.getElementById('fontSize')?.value) || 48,
            textColor: document.getElementById('textColor')?.value || '#ffffff',
            bgColor: document.getElementById('bgColor')?.value || '#4a90e2',
            animationType: document.getElementById('animationType')?.value || 'none',
            fps: parseInt(document.getElementById('fps')?.value) || 30,
            duration: parseInt(document.getElementById('duration')?.value) || 5
        };
    }

    async generateVideo() {
        if (this.isGenerating) {
            alert('⏳ جاري إنشاء فيديو بالفعل، انتظر قليلاً');
            return;
        }

        try {
            this.isGenerating = true;
            
            // تعطيل أزرار التحكم أثناء التوليد
            this.setButtonsState(true);
            
            // الحصول على الإعدادات
            const config = this.getConfig();
            
            // التحقق من وجود نص
            if (!config.text || config.text.trim() === '') {
                alert('❌ الرجاء إدخال نص للفيديو');
                this.setButtonsState(false);
                this.isGenerating = false;
                return;
            }

            console.log('🎬 بدء إنشاء الفيديو:', config);
            
            // إظهار شريط التقدم
            this.showProgress(true);
            
            // توليد الإطارات
            const frames = this.canvasEditor.generateFrames(config);
            
            // تصدير الفيديو
            this.currentVideo = await this.videoGenerator.exportVideo(frames, config);
            
            // تفعيل زر التحميل
            document.getElementById('downloadBtn').disabled = false;
            
            // إخفاء شريط التقدم
            this.showProgress(false);
            
            // إظهار رسالة نجاح
            alert('✅ تم إنشاء الفيديو بنجاح! يمكنك الآن تحميله.');
            
        } catch (error) {
            console.error('❌ خطأ في إنشاء الفيديو:', error);
            alert('❌ حدث خطأ في إنشاء الفيديو. تأكد من صحة الإعدادات وحاول مرة أخرى.');
            this.showProgress(false);
        } finally {
            this.setButtonsState(false);
            this.isGenerating = false;
        }
    }

    downloadVideo() {
        try {
            if (this.currentVideo) {
                const filename = `فيديو-${new Date().toLocaleString('ar-EG')}.webm`;
                this.videoGenerator.downloadVideo(this.currentVideo.url, filename);
            } else {
                alert('❌ لا يوجد فيديو للتحميل. أنشئ فيديو أولاً.');
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل الفيديو:', error);
            alert('❌ حدث خطأ في تحميل الفيديو');
        }
    }

    setButtonsState(disabled) {
        const generateBtn = document.getElementById('generateBtn');
        const previewBtn = document.getElementById('previewBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (generateBtn) generateBtn.disabled = disabled;
        if (previewBtn) previewBtn.disabled = disabled;
        // لا نعطل زر التحميل إذا كان الفيديو جاهزاً
        if (downloadBtn && !this.currentVideo) {
            downloadBtn.disabled = disabled;
        }
    }

    showProgress(show) {
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.display = show ? 'block' : 'none';
        }
    }

    // PWA: تسجيل Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => {
                        console.log('✅ ServiceWorker registered:', registration);
                    })
                    .catch(error => {
                        console.log('❌ ServiceWorker registration failed:', error);
                    });
            });
        }
    }

    // PWA: إعداد زر التثبيت
    setupInstallPrompt() {
        let deferredPrompt;
        const installBtn = document.getElementById('installBtn');

        if (!installBtn) return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.style.display = 'block';

            installBtn.addEventListener('click', async () => {
                installBtn.style.display = 'none';
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`✅ نتيجة التثبيت: ${outcome}`);
                    deferredPrompt = null;
                }
            });
        });

        // التحقق مما إذا كان التطبيق مثبتاً بالفعل
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA تم تثبيت التطبيق');
            if (installBtn) installBtn.style.display = 'none';
        });
    }
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 بدء تشغيل التطبيق...');
    new VideoGeneratorApp();
});
