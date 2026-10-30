import { useEffect, useMemo, useState, type FormEvent } from "react";
import PageHeader from "../components/PageHeader";
import MultiCalendar from "../components/MultiCalendar";
import { ErrorBox, Loading } from "../components/ErrorBox";
import { useAuth } from "../context/AuthContext";
import { usePageMeta } from "../hooks/usePageMeta";
import { consultService } from "../services";
import { CONSULT_NAME_MAX, CONSULT_TOPIC_MAX, GRADES, type ConsultMode, type Grade, type ConsultSlot, type NewSlot, type User } from "../services/types";

const PAGE_SIZE = 30;
const TZ = "Asia/Seoul";
const btn = "rounded-md bg-gradient-to-r from-navy-700 to-accent-700 px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50";
const ghost = "rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700";
const field = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800";

const dateLabel = (ms: number) => new Date(ms).toLocaleDateString("ko-KR", { timeZone: TZ, year: "numeric", month: "long", day: "numeric", weekday: "short" });
const timeLabel = (ms: number) => new Date(ms).toLocaleTimeString("ko-KR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const dayKey = (ms: number) => new Date(ms).toLocaleDateString("sv-SE", { timeZone: TZ });

function errorText(e: unknown): string {
  const code = (e as { code?: string }).code ?? "";
  if (code === "slot-taken") return "방금 다른 사람이 먼저 신청한 시간입니다. 목록을 새로 불러왔으니 다른 시간을 선택해 주세요.";
  if (code === "permission-denied") return "권한이 없습니다. 로그인했는지, Firestore 보안 규칙(FIREBASE_SETUP.md)이 게시되었는지 확인해 주세요.";
  if (code === "failed-precondition") return "Firestore 설정이 더 필요합니다. 브라우저 콘솔(F12)의 안내 링크를 확인해 주세요.";
  return "처리 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
}

const MAX_SLOTS = 100;

/** 교수: 선택한 날짜들 × (시작~종료를 상담 길이로 나눈 칸) 만들기 (한국 시간 기준) */
function buildSlots(dates: string[], from: string, to: string, minutes: number, mode: ConsultMode, place: string): NewSlot[] {
  const out: NewSlot[] = [];
  if (minutes < 5) return out;
  for (const date of [...dates].sort()) {
    const start = new Date(`${date}T${from}:00+09:00`).getTime();
    const end = new Date(`${date}T${to}:00+09:00`).getTime();
    if (!(end > start)) return [];
    for (let t = start; t + minutes * 60000 <= end; t += minutes * 60000) {
      out.push({ start: t, end: t + minutes * 60000, mode, place: place.trim() || undefined });
    }
  }
  return out;
}

function AddSlotsForm({ onDone, markedDays }: { onDone: () => void; markedDays: string[] }) {
  const [dates, setDates] = useState<string[]>([]);
  const [from, setFrom] = useState("15:00");
  const [to, setTo] = useState("17:00");
  const [minutes, setMinutes] = useState(30);
  const [mode, setMode] = useState<ConsultMode>("대면");
  const [place, setPlace] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const preview = useMemo(() => buildSlots(dates, from, to, minutes, mode, place), [dates, from, to, minutes, mode, place]);
  const tooMany = preview.length > MAX_SLOTS;
  const toggle = (d: string) => setDates((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!preview.length || tooMany) return;
    setBusy(true);
    setErr("");
    try {
      await consultService.createSlots(preview);
      setDates([]);
      onDone();
    } catch (x) {
      setErr(errorText(x));
    } finally {
      setBusy(false);
    }
  };

  const summary = !dates.length
    ? "달력에서 상담이 가능한 날짜를 클릭하세요. 시간은 한국 시간 기준입니다."
    : !preview.length
      ? "시간 범위를 확인해 주세요. (종료가 시작보다 늦어야 하고, 상담 시간보다 길어야 합니다)"
      : tooMany
        ? `한 번에 ${MAX_SLOTS}칸까지만 등록할 수 있습니다. (현재 ${preview.length}칸) 날짜나 시간 범위를 줄여 주세요.`
        : `${dates.length}일 × ${from}–${to} (${minutes}분 단위) = 총 ${preview.length}칸이 만들어집니다.`;

  return (
    <form onSubmit={submit} className="mb-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
      <h2 className="section-title">상담 가능 시간 등록 (교수 전용)</h2>
      <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
        <div>
          <p className="mb-2 text-sm font-medium">① 날짜 선택</p>
          <MultiCalendar selected={dates} onToggle={toggle} marked={markedDays} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium">② 시간·방식 (선택한 모든 날짜에 똑같이 적용)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label htmlFor="c-from" className="text-sm">시작</label><input id="c-from" type="time" required className={field} value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><label htmlFor="c-to" className="text-sm">종료</label><input id="c-to" type="time" required className={field} value={to} onChange={(e) => setTo(e.target.value)} /></div>
            <div>
              <label htmlFor="c-min" className="text-sm">1회 상담 시간</label>
              <select id="c-min" className={field} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m}분</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="c-mode" className="text-sm">방식</label>
              <select id="c-mode" className={field} value={mode} onChange={(e) => setMode(e.target.value as ConsultMode)}>
                <option>대면</option><option>온라인</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="c-place" className="text-sm">장소 또는 온라인 링크 (선택)</label>
            <input id="c-place" className={field} maxLength={200} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="예: ○○관 ○○○호 / https://meet.google.com/..." />
          </div>
          {dates.length > 0 && (
            <div className="flex flex-wrap gap-1.5" aria-label="선택한 날짜">
              {[...dates].sort().map((d) => (
                <button key={d} type="button" onClick={() => toggle(d)} aria-label={`${d} 선택 해제`}
                  className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs text-accent-700 hover:bg-accent-300 dark:bg-slate-700 dark:text-accent-300">{d.slice(5).replace("-", "/")} ✕</button>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300" role="status">{summary}</p>
          <button type="submit" className={btn} disabled={busy || !preview.length || tooMany}>{busy ? "등록 중…" : "시간 등록"}</button>
          {err && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{err}</p>}
        </div>
      </div>
    </form>
  );
}

function SlotRow({ s, user, isProfessor, onChanged, onError }: { s: ConsultSlot; user: User; isProfessor: boolean; onChanged: () => void; onError: (m: string) => void }) {
  const [asking, setAsking] = useState(false);
  const [topic, setTopic] = useState("");
  const [name, setName] = useState(user.name);
  const [grade, setGrade] = useState<Grade>("1학년");
  const [busy, setBusy] = useState(false);
  const mine = s.bookedBy === user.id;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    onError("");
    try { await fn(); setAsking(false); setTopic(""); }
    catch (e) { onError(errorText(e)); }
    finally { setBusy(false); onChanged(); }
  };

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="w-28 font-semibold text-navy-800 dark:text-navy-100">{timeLabel(s.start)} – {timeLabel(s.end)}</span>
        <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-800 dark:bg-navy-800 dark:text-navy-100">{s.mode}</span>
        {s.place && (s.place.startsWith("http")
          ? <a className="text-sm text-navy-700 underline dark:text-navy-300" href={s.place} target="_blank" rel="noopener noreferrer">온라인 링크</a>
          : <span className="text-sm text-slate-600 dark:text-slate-300">{s.place}</span>)}
        <span className="ml-auto flex items-center gap-2">
          {s.status === "open" && !isProfessor && !asking && <button type="button" className={btn} onClick={() => setAsking(true)}>신청</button>}
          {s.status === "open" && isProfessor && <span className="text-sm text-emerald-700 dark:text-emerald-300">비어 있음</span>}
          {s.status === "booked" && mine && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">내 예약</span>}
          {s.status === "booked" && !mine && !isProfessor && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-100">예약됨</span>}
          {s.status === "booked" && isProfessor && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900 dark:text-amber-100">예약됨</span>}
          {(mine || (isProfessor && s.status === "booked")) && (
            <button type="button" disabled={busy} className={ghost} onClick={() => { if (window.confirm("예약을 취소할까요?")) void run(() => consultService.cancel(s.id)); }}>예약 취소</button>
          )}
          {isProfessor && (
            <button type="button" disabled={busy} className="text-sm text-red-700 underline dark:text-red-300" onClick={() => { if (window.confirm(s.status === "booked" ? "신청된 시간입니다. 삭제하면 신청도 사라집니다. 삭제할까요?" : "이 시간을 삭제할까요?")) void run(() => consultService.deleteSlot(s.id)); }}>삭제</button>
          )}
        </span>
      </div>
      {s.booking && (
        <p className="mt-2 rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-900">
          <strong>{s.booking.studentName}</strong> ({s.booking.grade}){isProfessor && <> · {s.booking.studentEmail}</>} · 상담 주제: {s.booking.topic}
        </p>
      )}
      {asking && (
        <form className="mt-3 space-y-3" onSubmit={(e) => { e.preventDefault(); if (name.trim() && topic.trim()) void run(() => consultService.book(user, s.id, { name: name.trim(), grade, topic: topic.trim() })); }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`n-${s.id}`} className="text-sm font-medium">이름</label>
              <input id={`n-${s.id}`} required maxLength={CONSULT_NAME_MAX} className={field} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor={`g-${s.id}`} className="text-sm font-medium">학년</label>
              <select id={`g-${s.id}`} className={field} value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={`t-${s.id}`} className="text-sm font-medium">상담 주제 (무엇을 상담하고 싶은가요?)</label>
            <textarea id={`t-${s.id}`} required rows={3} maxLength={CONSULT_TOPIC_MAX} className={field} value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">이름·학년·주제와 로그인 이메일({user.email})이 교수에게 전달됩니다. 다른 학생에게는 보이지 않습니다.</p>
          <div className="flex gap-2">
            <button type="submit" className={btn} disabled={busy || !name.trim() || !topic.trim()}>{busy ? "신청 중…" : "신청 확정"}</button>
            <button type="button" className={ghost} onClick={() => setAsking(false)}>취소</button>
          </div>
        </form>
      )}
    </li>
  );
}

export default function Consult() {
  usePageMeta("상담 신청", "교수가 열어 둔 상담 가능 시간 중에서 원하는 시간을 골라 상담을 신청합니다. 구글 로그인이 필요합니다.");
  const { user, isProfessor } = useAuth();
  const [slots, setSlots] = useState<ConsultSlot[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionErr, setActionErr] = useState("");

  const load = async (u: User, cur: string | null, append: boolean) => {
    setLoading(true);
    try {
      const page = await consultService.listUpcoming(u, { pageSize: PAGE_SIZE, cursor: cur });
      setSlots((prev) => (append ? [...prev, ...page.items] : page.items));
      setCursor(page.nextCursor);
      setError("");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) void load(user, null, false);
    else { setSlots([]); setCursor(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const reload = () => user && load(user, null, false);
  const days = [...new Set(slots.map((s) => dayKey(s.start)))];
  const myCount = slots.filter((s) => s.bookedBy === user?.id).length;

  return (
    <>
      <PageHeader title="상담 신청" subtitle="교수가 열어 둔 상담 가능 시간 중에서 원하는 시간을 골라 신청하세요." />

      {!user ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
          <p className="font-medium">상담 시간을 보거나 신청하려면 로그인이 필요합니다.</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">화면 위쪽의 <strong>로그인</strong> 버튼으로 구글 계정에 로그인해 주세요.</p>
        </div>
      ) : (
        <>
          {isProfessor && <AddSlotsForm onDone={reload} markedDays={days} />}
          {!isProfessor && myCount > 0 && (
            <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" role="status">내 예약이 {myCount}건 있습니다. 변경하려면 예약 취소 후 다시 신청해 주세요.</p>
          )}
          {actionErr && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{actionErr}</p>}
          {error && <ErrorBox message={error} />}
          {!error && !loading && slots.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-600">현재 신청 가능한 상담 시간이 없습니다. 교수가 시간을 열면 이곳에 표시됩니다.</p>
          )}
          {days.map((d) => {
            const list = slots.filter((s) => dayKey(s.start) === d);
            return (
              <section key={d} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800" aria-labelledby={`d-${d}`}>
                <h2 id={`d-${d}`} className="section-title mb-1">{dateLabel(list[0].start)}</h2>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {list.map((s) => <SlotRow key={s.id} s={s} user={user} isProfessor={isProfessor} onChanged={reload} onError={setActionErr} />)}
                </ul>
              </section>
            );
          })}
          {loading && <Loading />}
          {cursor && !loading && (
            <div className="text-center"><button type="button" className={ghost} onClick={() => load(user, cursor, true)}>더 보기</button></div>
          )}
        </>
      )}
    </>
  );
}
