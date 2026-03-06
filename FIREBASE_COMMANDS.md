# Firebase Setup Commands

## 1. Login to Firebase
firebase login

## 2. Initialize Firebase in your project
firebase init

## 3. Select these options:
- Functions: Configure a Cloud Functions directory
- Hosting: Configure files for Firebase Hosting
- Use existing project: strategic-pathways-ba4ba

## 4. Deploy to Firebase
firebase deploy

## 5. Get VAPID Key
firebase messaging:generate-vapid-key

## 6. Add VAPID key to .env
VITE_FIREBASE_VAPID_KEY=your_generated_vapid_key