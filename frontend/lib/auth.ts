import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export async function linkWalletToFirebase(walletAddress: string) {
  try {
    // Sign in anonymously to Firebase Auth
    // This allows Firestore security rules to work properly
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Firebase authentication successful:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Firebase authentication failed:', error);
    throw error;
  }
}

// Helper to check if user is authenticated
export function onAuthChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}
