# 🗑️ حذف جميع المواد من قاعدة البيانات

## الطريقة 1: استخدام سكريبت SQL (موصى به)

### على Railway:

1. اذهب إلى Railway Dashboard
2. افتح PostgreSQL service
3. اضغط على "Query" أو "Connect"
4. انسخ والصق محتوى `scripts/clear-materials.sql`:

```sql
DELETE FROM materials;
```

5. اضغط "Run" أو "Execute"

### على PostgreSQL محلي:

```bash
psql -U postgres -d your_database_name -f scripts/clear-materials.sql
```

أو:

```bash
psql -U postgres -d your_database_name -c "DELETE FROM materials;"
```

## الطريقة 2: استخدام سكريبت Node.js

```bash
npm run clear-materials
```

**ملاحظة**: يتطلب اتصال بقاعدة البيانات (DATABASE_URL).

## الطريقة 3: من خلال Railway CLI

```bash
railway connect postgres
```

ثم في psql:

```sql
DELETE FROM materials;
```

## التحقق من الحذف

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
