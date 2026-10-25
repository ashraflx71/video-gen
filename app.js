// app.js
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const uploadVideo = document.getElementById('uploadVideo');
const overlayTextInput = document.getElementById('overlayText');
const addTextBtn = document.getElementById('addTextBtn');

const video = document.createElement('video');
video.muted = true;
video.playsInline = true;      // مهم للجوال
video.preload = 'auto';

let currentText = '';
let currentFilter = 'none';
let loopStarted = false;

uploadVideo.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (video.src) URL.revokeObjectURL(video.src);

  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  };
  video.onloadeddata = () => {
    video.play().catch(err => console.log('خطأ في التشغيل:', err));
  };
  video.onerror = () => {
    alert('تعذر قراءة هذا الفيديو (قد يكون الترميز غير مدعوم). جرّب MP4 بترميز H.264.');
  };

  video.src = URL.createObjectURL(file);
  video.load();

  if (!loopStarted) {
    loopStarted = true;
    requestAnimationFrame(drawFrame);
  }
});

addTextBtn.addEventListener('click', () => {
  currentText = overlayTextInput.value;
});

function applyFilter(filterStyle) {
  currentFilter = filterStyle;
  // بديل يعمل على Safari أيضاً
  canvas.style.filter = filterStyle;
}

function drawFrame() {
  // نرسم فقط عندما يتوفر إطار فعلي (readyState >= 2)
  if (video.readyState >= 2) {
    if ('filter' in ctx) ctx.filter = currentFilter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if ('filter' in ctx) ctx.filter = 'none';

    if (currentText) {
      const size = Math.max(24, Math.round(canvas.height / 15));
      ctx.font = `bold ${size}px Arial`;
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = size / 12;
      ctx.textAlign = 'center';
      ctx.strokeText(currentText, canvas.width / 2, canvas.height - size);
      ctx.fillText(currentText, canvas.width / 2, canvas.height - size);
    }
  }
  requestAnimationFrame(drawFrame);
}
const dbg = document.getElementById('debug');
function log(m){ dbg.textContent += m + '\n'; }

window.onerror = (msg, src, line) => log('JS خطأ: ' + msg + ' (سطر ' + line + ')');

video.addEventListener('error', () => {
  const codes = {1:'أُلغي',2:'شبكة',3:'فشل فك الترميز',4:'الصيغة/الترميز غير مدعوم'};
  log('خطأ الفيديو: ' + (codes[video.error.code] || video.error.code));
});
video.addEventListener('loadedmetadata', () =>
  log('الأبعاد: ' + video.videoWidth + 'x' + video.videoHeight));
video.addEventListener('playing', () => log('بدأ التشغيل'));
