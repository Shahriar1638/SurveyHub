/**
 * Firebase Admin SDK — server-side ID token verification for /api/auth/login.
 * Requires FIREBASE_PROJECT_ID (same value as the frontend VITE_projectId).
 * No service account file needed: verifyIdToken() uses Google's public certs.
 */
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('FATAL: FIREBASE_PROJECT_ID is not set. Refusing to start.');
  process.exit(1);
}

const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

if (!getApps().length) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

module.exports = { getAuth };
