import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LoginModal from "./LoginModal";

const NAV = [
  { to: "/", label: "홈", end: true },
  { to: "/research", label: "연구" },
  { to: "/publications", label: "논문·자료" },
  { to: "/teaching", label: "수업" },
  { to: "/lab", label: "연구실" },
  { to: "/contact", label: "연락처" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy-400 ${
    isActive
      ? "bg-navy-100 text-navy-900 dark:bg-navy-700 dark:text-white"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  }`;

export default function Header() {
  const { isProfessor, user, service } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = async () => {
    if (!service.isAvailable) return setShowLogin(true);
    setLoginError("");
    try {
      await service.signInWithGoogle();
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      setLoginError(
        code === "auth/unauthorized-domain"
          ? "이 주소가 Firebase '승인된 도메인'에 없습니다. FIREBASE_SETUP.md 4번을 확인하세요."
          : "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };

  const items = isProfessor ? [...NAV, { to: "/admin", label: "관리" }] : NAV;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-base font-bold text-navy-800 dark:text-navy-100 sm:text-lg">
          하정철 <span className="font-normal text-slate-500 dark:text-slate-400">통계학 연구실</span>
        </Link>

        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {items.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className={linkClass}>{n.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "밝은 모드로 전환" : "어두운 모드로 전환"}
            className="rounded-md p-2 text-lg hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy-400 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
          </button>
          {user ? (
            <button
              type="button"
              onClick={() => service.signOut()}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              로그아웃{user.role === "professor" ? " (교수)" : ""}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="rounded-md bg-gradient-to-r from-navy-700 to-accent-700 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-400"
            >
              로그인
            </button>
          )}
          <button
            type="button"
            className="rounded-md p-2 md:hidden hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="메뉴 열기"
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="모바일 메뉴" className="border-t border-slate-200 px-4 py-2 dark:border-slate-700 md:hidden">
          <ul>
            {items.map((n) => (
              <li key={n.to} onClick={() => setOpen(false)}>
                <NavLink to={n.to} end={n.end} className={linkClass}>{n.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {loginError && (
        <p role="alert" className="bg-red-50 px-4 py-2 text-center text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{loginError}</p>
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  );
}
