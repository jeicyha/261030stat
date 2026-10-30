import { useEffect, useRef } from "react";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="login-title" className="text-lg font-bold text-navy-900 dark:text-navy-100">로그인</h2>
        <p className="mt-3 text-slate-700 dark:text-slate-200">
          <strong>Firebase 연동 후 사용 가능</strong>합니다.
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          다음 단계에서 구글 로그인이 연결되면 교수님만 관리 메뉴를 쓸 수 있게 됩니다.
          지금은 화면 오른쪽 아래의 [교수 / 방문자] 스위치로 모습만 확인할 수 있어요.
        </p>
        <button
          ref={btn}
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-navy-700 px-4 py-2 font-medium text-white hover:bg-navy-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-400"
        >
          확인
        </button>
      </div>
    </div>
  );
}
