import { useAuth } from "../context/AuthContext";

/**
 * ⚠ 개발 확인용 [교수 / 방문자] 역할 전환 스위치입니다.
 * Firebase 로그인을 연결한 뒤에는 이 파일을 지우고,
 * components/Layout.tsx 안의 <DevRoleSwitch /> 한 줄만 삭제하면 됩니다.
 * (서비스에 devSetRole이 없으면 스스로 숨습니다.)
 */
export default function DevRoleSwitch() {
  const { user, service } = useAuth();
  if (!service.devSetRole) return null;
  const set = service.devSetRole.bind(service);
  const role = user?.role ?? "visitor";

  const btn = (r: "professor" | "visitor", label: string) => (
    <button
      type="button"
      onClick={() => set(r)}
      aria-pressed={role === r}
      className={`rounded px-2 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy-300 ${
        role === r ? "bg-white text-navy-900" : "text-navy-100 hover:bg-navy-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed bottom-3 right-3 z-40 flex items-center gap-1 rounded-lg bg-navy-900/95 p-1.5 shadow-lg ring-1 ring-white/20"
      role="group"
      aria-label="개발용 역할 전환"
    >
      <span className="px-1 text-[10px] text-navy-300">DEV</span>
      {btn("visitor", "방문자")}
      {btn("professor", "교수")}
    </div>
  );
}
