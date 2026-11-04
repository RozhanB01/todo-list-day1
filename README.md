# Moonberry — مون‌بری

کتابخانهٔ جادویی داستان‌ها و رمان‌های دنباله‌دار فارسی. یک پلتفرم کامل خواندن و انتشار:
صفحهٔ اول سینمایی، کتابخانهٔ قابل جست‌وجو و فیلتر، صفحهٔ هر رمان، خوانندهٔ سه‌حالته با
یادآوری هوشمند جای صفحه، حساب خواننده، کتابخانهٔ شخصی و میز نویسندهٔ محافظت‌شده.

شعار: «امشب، کدام دنیا منتظر توست؟» — «کمی جادو در هر قصه»

## ساختار پروژه

```
apps/api   Express + Prisma + PostgreSQL  (API، احراز هویت، مدیریت محتوا، آمار واقعی)
apps/web   React + Vite + TypeScript + Tailwind  (RTL، فونت‌های Vazirmatn/Estedad/Cormorant)
docker-compose.base44.yml   محیط توسعهٔ کامل (db + api + seed + web)
```

مرورگر فقط با پورت ۳۰۰۰ صحبت می‌کند؛ Vite درخواست‌های `/api`، `/uploads`، `/sitemap.xml` و
`/robots.txt` را به سرویس API پاس می‌دهد، بنابراین کوکی نشست هم‌مبدأ (same-origin) است.

## اجرا

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- وب: `http://localhost:3000`
- API: `http://localhost:3000/api/health`
- Swagger/OpenAPI ندارد؛ نقطه‌های اصلی در `apps/api/src/routes/` هستند.

`api` هنگام بالا آمدن `prisma generate` و `prisma db push` را اجرا می‌کند. سرویس `seed` بعد از
سالم‌شدن API اجرا می‌شود و ژانرها، حساب نویسنده و قصه‌های نمونه را می‌سازد (فقط اگر هنوز رمانی
در پایگاه داده نباشد).

## دسترسی نویسنده

`ADMIN_EMAIL` و `ADMIN_PASSWORD` از Secrets به سرویس‌ها می‌رسند (`/run/base44/app.env`). seed با
همین ایمیل/گذرواژه حساب `ADMIN` می‌سازد یا به‌روزرسانی می‌کند. سپس:

1. با همان ایمیل وارد شوید → `/admin`
2. رمان بسازید، جلد انتخاب یا بارگذاری کنید، فصل بنویسید و منتشر کنید.

هیچ ایمیل/گذرواژه/کلید مدیریتی در کد نیست؛ نقش مدیر در سرور بررسی می‌شود (`requireAdmin`).
ثبت‌نام با ایمیلِ `ADMIN_EMAIL` هم همان نقش را می‌دهد.

## مدل داده

`profiles`, `novels`, `genres`, `novel_genres`, `chapters`, `favorites`, `bookmarks`,
`reading_progress`, `novel_views`, `messages`.

- عمومی فقط رمان‌ها و فصل‌های منتشرشده و فقط رمانی که دست‌کم یک فصل منتشرشده دارد را می‌بیند.
- خواننده فقط داده‌های خودش را می‌خواند/تغییر می‌دهد (همهٔ مسیرهای `/api/me/*` نیازمند نشست).
- فقط نقش `ADMIN` می‌تواند محتوا بسازد، ویرایش یا حذف کند.
- شمارندهٔ بازدید، علاقه‌مندی و خواننده واقعی است؛ هیچ عدد ساختگی نمایش داده نمی‌شود.

## محتوای نمونه

پنج رمان منتشرشده و یک رمان پیش‌نویس، همه با `isDemo = true` و برچسب «نمونه» در رابط کاربری.
همه از `/admin` قابل ویرایش یا حذف کامل هستند. با حذف همهٔ رمان‌ها و اجرای دوبارهٔ سرویس `seed`
(پس از حذف سرویس seed و `up` مجدد) محتوای نمونه بازسازی می‌شود.

## خواندن

- سه حال‌وهوا: طلاییِ کاغذ، شب ماه‌گرفته، رؤیای رز — اندازهٔ متن، فاصلهٔ سطر و عرض متن قابل تغییر
  و در `localStorage` ذخیره می‌شود.
- پیشرفت مهمان در `moonberry.guest.progress` می‌ماند و پس از ورود/ثبت‌نام در پایگاه داده ادغام می‌شود.
- کلیدهای ← و → بین فصل‌ها جابه‌جا می‌شوند؛ خواندن بدون حساب آزاد است.

## بررسی‌ها

```bash
docker compose -f docker-compose.base44.yml exec -T web npx tsc --noEmit
docker compose -f docker-compose.base44.yml exec -T web npm run build
docker compose -f docker-compose.base44.yml exec -T api npx tsc --noEmit
curl -s http://localhost:3000/api/novels
```

سئو: عنوان/توضیح/کانونیکال/Open Graph برای هر مسیر در کلاینت به‌روزرسانی می‌شود،
`sitemap.xml` و `robots.txt` از API ساخته می‌شوند و JSON-LD برای رمان و فصل اضافه می‌شود.
مسیرهای `/admin` و `/library` با `noindex` علامت‌گذاری شده‌اند.

## استقرار

مخزن فاقد pipeline استقرار است. برای محیط واقعی: `apps/web` را با `npm run build` بسازید و
`dist` را با یک وب‌سرور سرو کنید، API را با `node`/`tsx` روی پورت دلخواه اجرا کنید،
`DATABASE_URL` و `SESSION_SECRET` را تأمین کنید و `/api`، `/uploads`، `/sitemap.xml` و
`/robots.txt` را به API پروکسی کنید. مسیر آپلودها را روی یک volume پایدار نگه دارید.
