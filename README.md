# ארנק הקופונים המשפחתי

אפליקציית ווב לניהול קופונים משפחתיים. Node/Express + SQLite (Prisma) בצד שרת, React + Vite בצד לקוח.

## הרצה מקומית

```bash
npm run install:all
npm run dev
```

השרת רץ על `http://localhost:3001`, הקליינט על `http://localhost:5173` (Vite proxy מפנה בקשות `/api` ו-`/uploads` לשרת).

צריך קובץ `server/.env` (ראו `server/.env.example`) עם `FAMILY_PIN` ו-`SESSION_SECRET`.

## פריסה ל-Railway

האפליקציה בנויה לרוץ כשירות יחיד בפרודקשן: Express מגיש גם את ה-API וגם את קבצי ה-React הבנויים (`client/dist`), אז צריך רק שירות אחד ב-Railway.

### שלבים

1. **דחיפה ל-GitHub** — ליצור repo חדש (פרטי, אם רוצים) ולדחוף את הקוד.

2. **יצירת פרויקט ב-Railway** — ["New Project" → "Deploy from GitHub repo"](https://railway.app/new), לבחור את ה-repo. Railway מזהה אוטומטית Node.js (Nixpacks) ומשתמש בקובץ `railway.json` שבשורש הפרויקט לפקודות ה-build/start.

3. **הוספת Volume קבוע** (חשוב! בלי זה, מסד הנתונים והתמונות יימחקו בכל דיפלוי מחדש):
   - בהגדרות השירות ב-Railway → **Volumes** → Add Volume
   - Mount path: `/data`

4. **הגדרת משתני סביבה** (Service → Variables):
   ```
   NODE_ENV=production
   FAMILY_PIN=<קוד PIN אמיתי לבחירתכם>
   SESSION_SECRET=<מחרוזת אקראית וארוכה>
   DATABASE_URL=file:/data/prod.db
   UPLOAD_DIR=/data/uploads
   ```
   (את `PORT` Railway מגדיר אוטומטית — אין צורך להוסיף.)

5. **דיפלוי** — Railway יריץ `npm run build` (בונה client + server, ומריץ `prisma generate`) ואז `npm run start` (מריץ `prisma migrate deploy` ליצירת הטבלאות ב-volume, ואז מפעיל את השרת).

6. **גישה מהפלאפון** — אחרי שהדיפלוי מסתיים, Railway נותן כתובת ציבורית (`https://your-app.up.railway.app`). זו הכתובת שנכנסים אליה מהפלאפון — עובד מכל מקום, לא רק בבית, ולא תלוי שהמחשב שלכם דלוק.

### עדכונים עתידיים

כל `git push` ל-branch הראשי מפעיל דיפלוי אוטומטי מחדש ב-Railway (אם מחוברים ל-GitHub).
