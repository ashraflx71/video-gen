// app.js - نسخة محسنة لمنع الشاشة السوداء

const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const uploadVideo = document.getElementById('uploadVideo');
const overlayTextInput = document.getElementById('overlayText');
const addTextBtn = document.getElementById('addTextBtn');

let video = document.createElement('video');
video.crossOrigin = "anonymous";
video.muted = true; // كتم الصوت لمنع مشاكل التشغيل التلقائي في المتصفحات
let currentText = '';
let currentFilter = 'none';

// تحميل الفيديو عند اختياره
uploadVideo.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    video.src = URL.createObjectURL(file);
    video.load();
    video.onloadeddata = () => {
      video.play().then(() => {
        drawFrame();
      }).catch(err => {
        console.log("خطأ في تشغيل الفيديو:", err);
      });
    };
  }
});

// إضافة النص
addTextBtn.addEventListener('click', () => {
  currentText = overlayTextInput.value;
});

// تطبيق الفلاتر
function applyFilter(filterStyle) {
  currentFilter = filterStyle;
}

// رسم الإطارات باستمرار
function drawFrame() {
  if (!video.paused && !video.ended) {
    // تطبيق الفلتر على اللوحة
    ctx.filter = currentFilter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // إعادة إلغاء الفلتر للنص
    ctx.filter = 'none';

    // كتابة النص فوق الفيديو إذا كان موجوداً
    if (currentText) {
      ctx.font = 'bold 30px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      
      // رسم النص في أسفل منتصف اللوحة
      ctx.strokeText(currentText, canvas.width / 2, canvas.height - 40);
      ctx.fillText(currentText, canvas.width / 2, canvas.height - 40);
    }
  }
  requestAnimationFrame(drawFrame);
}
