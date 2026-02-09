# Setup Instructions

## 1. Firebase Setup

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project (or use an existing one).
3.  **Enable Firestore**: Go to "Firestore Database" -> "Create Database". Start in **Test Mode** (for now).
4.  **Register App**:
    -   Click the gear icon -> "Project settings".
    -   Under "Your apps", click the web icon (`</>`).
    -   Register the app nickname (e.g., "PHDMail").
    -   Select **npm** (do not use the <script> tag).
    -   Copy the `firebaseConfig` object.

## 2. Configure Frontend

Create a `.env` file in the root directory (`c:/Projetos/phdmail/.env`) with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 3. Configure Backend (Email Sender)

1.  Navigate to `backend` folder: `cd backend`
2.  Install Python dependencies: `pip install -r requirements.txt`
3.  **Service Account**:
    -   In Firebase Console -> Project settings -> **Service accounts**.
    -   Click "Generate new private key".
    -   Save the file as `serviceAccountKey.json` inside the `backend/` folder.
4.  **SMTP Configuration**:
    -   Create a `.env` file inside `backend/`:

```env
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASSWORD=your_email_password
```

## 4. Running the System

1.  **Start Frontend**: `npm run dev` in the root folder.
2.  **Start Backend**: `python main.py` in the `backend/` folder.
