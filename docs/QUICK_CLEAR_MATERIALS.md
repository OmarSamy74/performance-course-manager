# 🗑️ حذف جميع المواد - دليل سريع

## ✅ الطريقة الأسهل (بدون تثبيت psql):

### 1. احصل على DATABASE_URL من Railway:

1. اذهب إلى Railway Dashboard
2. PostgreSQL service → "Variables" tab
3. انسخ قيمة `DATABASE_URL`

### 2. شغّل السكريبت:

```bash
DATABASE_URL="your-database-url-here" npm run clear-materials:railway
```

**أو** إذا كان DATABASE_URL موجود في environment:

```bash
npm run clear-materials:railway
```

## 🔧 تثبيت psql (اختياري):

إذا أردت استخدام `railway connect postgres`:

```bash
brew install postgresql@15
```

ثم:

```bash
railway connect postgres
# في psql:
DELETE FROM materials;
```

## 🌐 استخدام Railway Web Interface:

1. Railway Dashboard → PostgreSQL → "Data" tab
2. Query Editor
3. نفّذ: `DELETE FROM materials;`

## ✅ التحقق:

```sql
SELECT COUNT(*) FROM materials;
```

يجب أن يعيد `0`.
