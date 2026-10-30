import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User as FbUser,
} from "firebase/auth";
import type { AuthService } from "./authService";
import { getFirebaseApp } from "./firebaseApp";
import type { User } from "./types";

/** .env에 Firebase 설정이 들어 있는지 */
export const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID,
);

const PROFESSOR_EMAIL = (import.meta.env.VITE_PROFESSOR_EMAIL ?? "").toLowerCase();

function toUser(u: FbUser | null): User | null {
  if (!u) return null;
  const email = (u.email ?? "").toLowerCase();
  // 보안 규칙과 같은 기준: 교수 이메일 + 이메일 인증 완료
  const isProfessor = !!PROFESSOR_EMAIL && email === PROFESSOR_EMAIL && u.emailVerified;
  return {
    id: u.uid,
    name: u.displayName ?? email,
    email,
    role: isProfessor ? "professor" : "visitor",
  };
}

export function createFirebaseAuthService(): AuthService {
  const auth = getAuth(getFirebaseApp());
  let current: User | null = null;

  return {
    isAvailable: true,
    getCurrentUser: () => current,
    onAuthChange(callback) {
      return onAuthStateChanged(auth, (u) => {
        current = toUser(u);
        callback(current);
      });
    },
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);
      current = toUser(cred.user);
      return current!;
    },
    async signOut() {
      await fbSignOut(auth);
    },
  };
}
