import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../services";
import type { AuthService } from "../services/authService";
import type { User } from "../services/types";

interface AuthValue {
  user: User | null;
  isProfessor: boolean;
  service: AuthService;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(setUser);
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isProfessor: user?.role === "professor", service: authService }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  return ctx;
}
