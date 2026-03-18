class CanvasEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.width = 1280;
        this.height = 720;
        this.frames = [];
        this.currentFrame = 0;
    }

    // تحديث أبعاد الكانفاس
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    // رسم إطار واحد
    drawFrame(config) {
        const {
            text = '',
            bgColor = '#4a90e2',
            textColor = '#ffffff',
            fontSize = 48,
            animationType = 'none',
            frameIndex = 0,
            totalFrames = 30
        } = config;

        // مسح الكانفاس
        this.ctx.clearRect(0, 0, this.width, this.height);

        // رسم الخلفية
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // رسم تأثيرات إضافية (خلفية متحركة)
        this.drawBackgroundEffects(frameIndex, totalFrames);

        // إعداد النص
        this.ctx.font = `bold ${fontSize}px 'Arial', 'Segoe UI', sans-serif`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // حساب موضع النص مع تأثيرات الحركة
        let x = this.width / 2;
        let y = this.height / 2;

        // تطبيق تأثيرات الحركة
        const animationOffset = this.calculateAnimationOffset(
            animationType, 
            frameIndex, 
            totalFrames
        );

        x += animationOffset.x;
        y += animationOffset.y;

        // رسم ظل للنص
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;

        // رسم النص
        this.ctx.fillText(text, x, y);

        // إعادة تعيين الظل
        this.ctx.shadowColor = 'transparent';

        // رسم إطار (border) حول النص
        if (animationType === 'bounce') {
            this.drawBounceEffect(x, y, fontSize, frameIndex);
        }

        // إضافة تاريخ/وقت للإطار
        this.drawFrameInfo(frameIndex, totalFrames);
    }

    // تأثيرات خلفية متحركة
    drawBackgroundEffects(frameIndex, totalFrames) {
        const progress = frameIndex / totalFrames;
        
        // رسم نقاط متحركة في الخلفية
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(progress * Math.PI * 2 + i) * 50 + i * 100) % this.width;
            const y = (Math.cos(progress * Math.PI * 2 + i) * 50 + i * 50) % this.height;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(progress * Math.PI * 2 + i) * 0.1})`;
            this.ctx.fill();
        }
    }

    // حساب إزاحة الحركة
    calculateAnimationOffset(type, frameIndex, totalFrames) {
        const progress = frameIndex / totalFrames;
        let x = 0, y = 0;

        switch(type) {
            case 'slide':
                // حركة انزلاق من اليسار إلى الوسط
                x = this.width * (0.5 - Math.abs(progress - 0.5) * 2);
                break;
            case 'fade':
                // لا تغيير في الموضع (الشفافية تتعامل بشكل منفصل)
                this.ctx.globalAlpha = Math.sin(progress * Math.PI);
                break;
            case 'bounce':
                // حركة ارتداد
                y = Math.sin(progress * Math.PI * 4) * 50;
                break;
            case 'rotate':
                // الدوران (سيتم تطبيقه بشكل منفصل)
                this.ctx.save();
                this.ctx.translate(this.width / 2, this.height / 2);
                this.ctx.rotate(progress * Math.PI * 2);
                this.ctx.translate(-this.width / 2, -this.height / 2);
                break;
            default:
                // بدون حركة
                break;
        }

        return { x, y };
    }

    // تأثير الارتداد
    drawBounceEffect(x, y, fontSize, frameIndex) {
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, fontSize / 2 + 10 + Math.sin(frameIndex * 0.5) * 5, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    // رسم معلومات الإطار
    drawFrameInfo(frameIndex, totalFrames) {
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`إطار ${frameIndex + 1}/${totalFrames}`, this.width - 10, 20);
    }

    // إنشاء جميع الإطارات
    generateFrames(config) {
        const {
            text,
            bgColor,
            textColor,
            fontSize,
            animationType,
            duration,
            fps
        } = config;

        const totalFrames = duration * fps;
        this.frames = [];

        for (let i = 0; i < totalFrames; i++) {
            this.drawFrame({
                text,
                bgColor,
                textColor,
                fontSize,
                animationType,
                frameIndex: i,
                totalFrames
            });
            
            // حفظ الإطار كصورة
            this.frames.push(this.getFrameData());
        }

        return this.frames;
    }

    // الحصول على بيانات الإطار الحالي
    getFrameData() {
        return this.canvas.toDataURL('image/jpeg', 0.9);
    }

    // معاينة إطار معين
    previewFrame(index, config) {
        this.drawFrame({
            ...config,
            frameIndex: index,
            totalFrames: config.duration * config.fps
        });
    }
}
