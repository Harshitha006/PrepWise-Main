import admin from "firebase-admin";

const getAdminApp = () => {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      console.warn("Firebase Admin credentials missing. Initialization skipped.");
      // Return a mock or handle it in the exported members
      return null;
    }
  }
  return admin.apps[0];
};

const app = getAdminApp();

export const adminAuth = app ? admin.auth(app) : ({} as admin.auth.Auth);
export const adminDb = app ? admin.firestore(app) : ({} as admin.firestore.Firestore);
export default admin;
