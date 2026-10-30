import { useState } from "react";

const TZ = "Asia/Seoul";
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");
const key = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** 오늘 날짜 (한국 시간) YYYY-MM-DD */
export const todayKey = () => new Date().toLocaleDateString("sv-SE", { timeZone: TZ });

interface Props {
  selected: string[]; // YYYY-MM-DD 목록
  onToggle: (day: string) => void;
  /** 이미 상담 시간이 열려 있는 날 (점으로 표시) */
  marked?: string[];
}

/** 클릭으로 여러 날짜를 고르는 월간 달력 (지난 날짜는 선택 불가) */
export default function MultiCalendar({ selected, onToggle, marked = [] }: Props) {
  const today = todayKey();
  const [ty, tm] = today.split("-").map(Number);
  const [view, setView] = useState({ y: ty, m: tm - 1 });

  const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const count = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const move = (delta: number) =>
    setView((v) => {
      const t = v.y * 12 + v.m + delta;
      return { y: Math.floor(t / 12), m: t % 12 };
    });
  const atCurrentMonth = view.y === ty && view.m === tm - 1;

  return (
    <div className="w-full max-w-sm rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} disabled={atCurrentMonth} aria-label="이전 달"
          className="rounded-md px-3 py-1 text-lg hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700">‹</button>
        <p className="font-semibold text-navy-800 dark:text-navy-100" aria-live="polite">{view.y}년 {view.m + 1}월</p>
        <button type="button" onClick={() => move(1)} aria-label="다음 달"
          className="rounded-md px-3 py-1 text-lg hover:bg-slate-100 dark:hover:bg-slate-700">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400" aria-hidden="true">
        {WEEK.map((w, i) => <span key={w} className={i === 0 ? "text-red-600 dark:text-red-400" : ""}>{w}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const k = key(view.y, view.m, d);
          const past = k < today;
          const on = selected.includes(k);
          const has = marked.includes(k);
          return (
            <button
              key={k}
              type="button"
              disabled={past}
              aria-pressed={on}
              aria-label={`${view.y}년 ${view.m + 1}월 ${d}일${has ? " (이미 시간이 열려 있음)" : ""}`}
              onClick={() => onToggle(k)}
              className={`relative aspect-square rounded-lg text-sm transition ${
                on
                  ? "bg-gradient-to-br from-navy-700 to-accent-700 font-bold text-white shadow"
                  : past
                    ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
                    : "hover:bg-accent-100 dark:text-slate-100 dark:hover:bg-slate-700"
              } ${k === today && !on ? "ring-1 ring-accent-500" : ""}`}
            >
              {d}
              {has && <span aria-hidden="true" className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${on ? "bg-white" : "bg-accent-600"}`} />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">날짜를 눌러 선택·해제합니다. 여러 날을 고를 수 있어요. (점 = 이미 시간이 열린 날)</p>
    </div>
  );
}
