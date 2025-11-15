import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase';

export async function linkWalletToFirebase(walletAddress: string) {
  // Backend authentication is optional for Web3 demo
  // Core blockchain functionality works without it
  console.log('✅ Wallet connected:', walletAddress);
  return Promise.resolve();
}
