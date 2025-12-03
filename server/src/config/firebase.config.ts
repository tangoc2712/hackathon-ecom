import admin from 'firebase-admin';

let credential;

if (process.env.NODE_ENV === 'production') {
    // In Cloud Run, use the default service account (Application Default Credentials)
    credential = admin.credential.applicationDefault();
} else {
    // In local development, use the key file
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require('../../firebaseServiceAccountKey.json');
        credential = admin.credential.cert(serviceAccount);
    } catch (error) {
        console.warn("Warning: firebaseServiceAccountKey.json not found. Falling back to default credentials.");
        credential = admin.credential.applicationDefault();
    }
}

const firebaseApp = admin.initializeApp({
    credential,
});

export default firebaseApp;