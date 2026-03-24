// اسم النسخة لضمان التحديث التلقائي
const CACHE_NAME = 'Ashraf-Tech-2026-v1';

// الملفات الأساسية التي نريدها أن تفتح "فورا" حتى بدون إنترنت
const assetsToCache = [
  '/',
  '/index.html',
  '/css/luxury-gold-style.css', // ملف التنسيق الأسود والذهبي
  '/js/video-gen-logic.js',
  '/images/logo-2026.png'
];

// 1. تثبيت الخدمة وحفظ الملفات الأساسية (البرمجة الخضراء - توفير بيانات)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// 2. استراتيجية "السرعة أولا" (Cache-First Strategy)
// تضمن فتح الموقع في أقل من ثانية واحدة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // إضافة الملفات الجديدة للذاكرة تلقائياً لتحسين الأداء لاحقاً
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // في حالة انقطاع الإنترنت تماما، يظهر صفحة مخصصة تخبر المستخدم بالانتظار
      return caches.match('/offline.html');
    })
  );
});

// 3. التحديث التلقائي (Background Sync)
// ميزة هامة جدا لرفع الفيديوهات أو بيانات الـ SEO في الخلفية
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-video-gen') {
    event.waitUntil(sendDataToServer());
  }
});
