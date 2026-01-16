# 🗑️ حذف جميع المواد من قاعدة البيانات

## الطريقة 1: استخدام سكريبت Node.js (موصى به - لا يحتاج psql)

### على Railway:

1. اذهب إلى Railway Dashboard
2. افتح PostgreSQL service
3. اضغط على "Variables" tab
4. انسخ قيمة `DATABASE_URL`

5. في Terminal المحلي:
```bash
# Set DATABASE_URL and run script
export DATABASE_URL="your-database-url-here"
npm run clear-materials:railway
```

أو في سطر واحد:
```bash
DATABASE_URL="your-database-url" npm run clear-materials:railway
```

### من Railway CLI:

```bash
railway run npm run clear-materials:railway
```

## الطريقة 2: استخدام سكريبت SQL مباشرة

### على Railway Dashboard:

1. اذهب إلى Railway Dashboard
2. افتح PostgreSQL service
3. اضغط على "Query" أو "Connect"
4. انسخ والصق:

```sql
DELETE FROM materials;
```

5. اضغط "Run" أو "Execute"

## الطريقة 3: تثبيت psql (للمستخدمين المتقدمين)

### على macOS:

```bash
# Using Homebrew
brew install postgresql

# Then connect
railway connect postgres
```

### على Linux:

```bash
sudo apt-get install postgresql-client
```

### على Windows:

تحميل من: https://www.postgresql.org/download/windows/

## الطريقة 4: استخدام Railway Web Interface

1. اذهب إلى Railway Dashboard
2. PostgreSQL service → "Data" tab
3. استخدم Query Editor المدمج
4. نفّذ: `DELETE FROM materials;`

## التحقق من الحذف

بعد الحذف، تحقق:

```sql
SELECT COUNT(*) FROM materials;
```

يجب أن يعيد `0`.

## ⚠️ تحذير

هذا الأمر **يحذف جميع المواد بشكل دائم**. تأكد من عمل نسخة احتياطية إذا كنت تحتاج البيانات.

## بعد الحذف

بعد حذف المواد، يمكنك:
1. إضافة مواد جديدة باستخدام روابط Google Drive
2. استخدام الرابط الافتراضي: `https://drive.google.com/file/d/1fB_M6Sumtr37jx5VOvmMADAHCdcNEQhk/view?usp=sharing`

## استكشاف الأخطاء

### خطأ: "DATABASE_URL is required"
- تأكد من نسخ `DATABASE_URL` من Railway Variables
- تأكد من أن الرابط يبدأ بـ `postgresql://`

### خطأ: "Connection refused"
- تأكد من أن قاعدة البيانات تعمل على Railway
- تحقق من صحة `DATABASE_URL`

### خطأ: "psql must be installed"
- استخدم `npm run clear-materials:railway` بدلاً من `railway connect postgres`
- أو ثبّت psql باستخدام Homebrew
