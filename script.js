// --- إعدادات المحرك السينمائي Creative 2026 ---
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('videoText');
const exportBtn = document.getElementById('exportBtn');

// إعدادات الألوان الفخمة
const GOLD_COLOR = "#D4AF37";
const BLACK_BG = "#000000";

// إنشاء جسيمات الذهب المتحركة (50 ذرة لضمان خفة الأداء على الموبايل)
const particles = [];
for (let i = 0; i < 50; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random()
    });
}

// وظيفة رسم وتحديث الجسيمات (خلفية حية)
function drawBackground() {
    ctx.fillStyle = BLACK_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // تحريك الجسيم للأسفل بنعومة
        p.y += p.speed;
        if (p.y > canvas.height) p.y = 0;
    });
}

// وظيفة رسم النص واللوجو (الواجهة الاحترافية)
function drawUI() {
    const text = textInput.value || "Creative 2026";

    // 1. رسم اللوجو (العلامة المائية) في الزاوية
    ctx.fillStyle = "rgba(212, 175, 55, 0.4)";
    ctx.font = "italic 24px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Creative 2026 ©", canvas.width - 40, 60);

    // 2. رسم النص الأساسي (كبير وواضح جداً)
    ctx.fillStyle = GOLD_COLOR;
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // إضافة ظل خفيف للنص لزيادة الفخامة
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0; // إعادة التعيين
}

// الحلقة البرمجية للتحديث المستمر (Animation Loop)
function animate() {
    drawBackground();
    drawUI();
    requestAnimationFrame(animate);
}

// ميزة تحويل النص إلى صوت (Arabic TTS)
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // إيقاف أي صوت سابق
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'ar-SA';
        msg.rate = 0.9; // سرعة هادئة وفخمة
        window.speechSynthesis.speak(msg);
    }
}

// زر التوليد والتحميل
exportBtn.addEventListener('click', () => {
    const text = textInput.value || "Creative 2026";
    speakText(text);

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Creative_2026_${Date.now()}.webm`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    recorder.start();
    alert("جاري تسجيل المشهد السينمائي.. انتظر 5 ثوانٍ للتحميل.");
    setTimeout(() => recorder.stop(), 5000); 
});

// بدء التشغيل فور فتح الصفحة
animate();
