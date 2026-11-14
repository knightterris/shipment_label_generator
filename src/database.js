import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, push, set, get, query, orderByChild, serverTimestamp } from 'firebase/database';
import { firebaseConfig } from './firebase-config';
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || firebaseConfig.databaseURL,
};
const ready = Object.values(config).every(value => typeof value === 'string' && value.trim() && !value.includes('YOUR_'));
const app = ready ? initializeApp(config) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getDatabase(app) : null;
export function databaseReady() { return ready; }
export function watchAccount(callback) {
  if (!auth) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
}
export async function login(email, password) {
  if (!auth) throw new Error('Configure Firebase in .env.local first.');
  return signInWithEmailAndPassword(auth, email, password);
}
export async function logout() { if (auth) await signOut(auth); }
function batches() {
  if (!db || !auth?.currentUser) throw new Error('Sign in before saving or loading shipments.');
  return ref(db, `users/${auth.currentUser.uid}/shipmentBatches`);
}
export async function listBatches() {
  const snapshot = await get(query(batches(), orderByChild('createdAt')));
  const records = [];
  snapshot.forEach(item => {
    const data = item.val();
    records.push({ ...data, id: item.key, shipments: Array.isArray(data.shipments) ? data.shipments : Object.values(data.shipments || {}), createdAt: new Date(data.createdAt).toISOString() });
  });
  return records.reverse();
}
export async function saveBatch({ shipments, logo }) {
  if (!shipments.length) throw new Error('Add a shipment before saving.');
  const data = { shipments, logo: logo || '', schemaVersion: 1 };
  if (new TextEncoder().encode(JSON.stringify(data)).length > 850000)
    throw new Error('This batch is too large to save. Use a smaller logo or save fewer labels.');
  const batchRef = push(batches());
  await set(batchRef, { ...data, createdAt: serverTimestamp() });
  return batchRef.key;
}
