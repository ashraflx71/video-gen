// إعدادات المحرك الرسومي
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('videoText');
const exportBtn = document.getElementById('exportBtn');

// إعدادات افتراضية للفخامة (اللون الذهبي والأسود)
const themeColor = "#D4AF37"; // Gold
const bgColor = "#000000";    // Black

// وظيفة لرسم الإطارات (Frames) بدقة عالية
function drawFrame(text) {
    // تنظيف المساحة
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // إعدادات النص (خط كبير 30px للقراءة السهلة)
    ctx.fillStyle = themeColor;
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // رسم النص في منتصف الكانفاس
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// ميزة تحويل النص إلى صوت (Text-to-Speech)
function speakText(text) {
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'ar-SA'; // دعم اللغة العربية
        window.speechSynthesis.speak(msg);
    }
}

// تحديث اللحظة (Real-time Preview)
textInput.addEventListener('input', (e) => {
    drawFrame(
function drawFrame(text) {
    // تنظيف المساحة بالأسود الفخم
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- إضافة اللوجو في الزاوية (العلامة المائية) ---
    ctx.fillStyle = "rgba(212, 175, 55, 0.5)"; // ذهبي شفاف قليلاً
    ctx.font = "italic bold 24px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Creative 2026 ©", canvas.width - 30, 50); 
    // ------------------------------------------

    // رسم النص الأساسي في المنتصف
    ctx.fillStyle = themeColor; // ذهبي خالص
    ctx.font = "bold 45px Arial"; // خط كبير جداً وواضح
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// وظيفة التوليد الاحترافية
exportBtn.addEventListener('click', () => {
    const text = textInput.value;
    
    // 1. تشغيل الصوت تزامناً مع الفيديو
    speakText(text);

    // 2. تحويل الكانفاس إلى صورة أو دفق فيديو (Stream)
    const stream = canvas.captureStream(30); // 30 إطار في الثانية
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Creative_2026_Video.webm';
        a.click();
        
        // تنظيف الذاكرة فوراً (Memory Management)
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 5000); // توليد فيديو مدته 5 ثوانٍ كمثال
    
    alert("بدأ توليد الفيديو، سيتم التحميل تلقائياً عند الانتهاء.");
});

// الرسم الأولي عند فتح الصفحة
drawFrame("Creative 2026");
