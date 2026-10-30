import type { Role, User } from "./types";

/**
 * 로그인 서비스의 "약속(인터페이스)"입니다.
 * 화면은 이 약속만 알고 있으므로, 나중에 firebaseAuthService.ts를 만들어
 * services/index.ts에서 mock 대신 끼워 넣기만 하면 로그인 방식이 바뀝니다.
 */
/** 개발용 가짜 역할: 방문자(비로그인) / 학생(로그인) / 교수 */
export type DevRole = Role | "student";

export interface AuthService {
  /** 지금 로그인한 사용자 (없으면 null) */
  getCurrentUser(): User | null;
  /** 로그인 상태가 바뀔 때마다 알려 줍니다. 반환값은 구독 해제 함수 */
  onAuthChange(callback: (user: User | null) => void): () => void;
  /** 구글 로그인 */
  signInWithGoogle(): Promise<User>;
  signOut(): Promise<void>;
  /** 이 서비스가 실제로 로그인할 수 있는지 (mock은 false) */
  readonly isAvailable: boolean;
  /** 개발 확인용: 역할 강제 전환. 실제 서비스에는 없는 기능입니다. */
  devSetRole?(role: DevRole): void;
}

export class AuthNotAvailableError extends Error {
  constructor() {
    super("Firebase 연동 후 사용 가능합니다.");
    this.name = "AuthNotAvailableError";
  }
}
