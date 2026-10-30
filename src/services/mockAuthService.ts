import { AuthNotAvailableError, type AuthService, type DevRole } from "./authService";
import type { User } from "./types";

/**
 * 지금 단계에서 쓰는 "가짜 로그인"입니다.
 * 실제 로그인은 되지 않고, 화면 구석의 [교수/방문자] 스위치로 역할만 바꿔 볼 수 있습니다.
 */
const PROFESSOR: User = {
  id: "mock-professor",
  name: "하정철",
  email: "jeicy@kmu.kr",
  role: "professor",
};

const STUDENT: User = {
  id: "mock-student",
  name: "[샘플] 학생",
  email: "student@example.com",
  role: "visitor",
};

export function createMockAuthService(): AuthService {
  let user: User | null = null; // null = 방문자
  const listeners = new Set<(u: User | null) => void>();
  const emit = () => listeners.forEach((fn) => fn(user));

  return {
    isAvailable: false,
    getCurrentUser: () => user,
    onAuthChange(callback) {
      listeners.add(callback);
      callback(user);
      return () => {
        listeners.delete(callback);
      };
    },
    async signInWithGoogle() {
      throw new AuthNotAvailableError();
    },
    async signOut() {
      user = null;
      emit();
    },
    devSetRole(role: DevRole) {
      user = role === "professor" ? PROFESSOR : role === "student" ? STUDENT : null;
      emit();
    },
  };
}
