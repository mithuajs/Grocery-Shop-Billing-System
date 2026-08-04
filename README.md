# Grocery Shop Billing System

Bengali grocery billing system for a college project. The existing UI is unchanged; Firebase Authentication and Cloud Firestore now provide the shared backend.

## Firebase setup (one time)
1. Firebase Console → Authentication → Sign-in method → Email/Password চালু রাখুন।
2. Authentication → Settings → Authorized domains-এ `localhost`, `127.0.0.1` এবং `mithuajs.github.io` যোগ করুন।
3. Authentication → Users-এ এই admin user তৈরি করুন:
   - Email: `admin@grocery-shop-billing-system.firebaseapp.com`
   - Password: কমপক্ষে ৬ অক্ষরের একটি password
4. Firestore Database তৈরি করুন।
5. Firebase CLI দিয়ে rules ও hosting publish করুন:

```powershell
npx firebase-tools login
npx firebase-tools use grocery-shop-billing-system
npx firebase-tools deploy --only firestore:rules,hosting
```

## Login
- Username: `Admin`
- Password: Firebase Authentication-এ admin user তৈরির সময় দেওয়া password

প্রথম সফল login-এর পরে Firestore খালি থাকলে ৯টি sample product স্বয়ংক্রিয়ভাবে যোগ হবে। Product, stock, bill এবং sales history Firestore-এ সংরক্ষিত হবে।

## Local run
```powershell
npm start
```
তারপর `http://127.0.0.1:3000/page/login.html` খুলুন। Browser এখন Firebase backend ব্যবহার করবে।

## Local API tests
```powershell
npm test
```