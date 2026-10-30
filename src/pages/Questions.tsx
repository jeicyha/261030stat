import { useEffect, useState, type FormEvent } from "react";
import Markdown from "../components/Markdown";
import PageHeader from "../components/PageHeader";
import { ErrorBox, Loading } from "../components/ErrorBox";
import { useAuth } from "../context/AuthContext";
import { usePageMeta } from "../hooks/usePageMeta";
import { questionService } from "../services";
import { QUESTION_LIMITS, type Question } from "../services/types";

const PAGE_SIZE = 10;
const btn = "rounded-md bg-gradient-to-r from-navy-700 to-accent-700 px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50";
const field = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800";

function errorText(e: unknown): string {
  const code = (e as { code?: string }).code ?? "";
  if (code === "permission-denied")
    return "권한이 없습니다. 로그인했는지, Firestore 보안 규칙(FIREBASE_SETUP.md)이 게시되었는지 확인해 주세요.";
  if (code === "failed-precondition")
    return "Firestore 설정이 더 필요합니다. 브라우저 콘솔(F12)의 안내 링크를 확인해 주세요.";
  return "처리 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
}

const fmt = (ms: number) => new Date(ms).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });

function QuestionCard({ q, onChanged }: { q: Question; onChanged: () => void }) {
  const { user, isProfessor } = useAuth();
  const [draft, setDraft] = useState(q.answer ?? "");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const canDelete = isProfessor || user?.id === q.authorId;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr("");
    try {
      await fn();
      onChanged();
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${q.answer ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100" : "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"}`}>
          {q.answer ? "답변 완료" : "답변 대기"}
        </span>
        {q.course && <span>{q.course}</span>}
        <span>{q.authorName}</span>
        <time>{fmt(q.createdAt)}</time>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-navy-900 dark:text-white">{q.title}</h3>
      <Markdown className="mt-2 text-sm">{q.body}</Markdown>

      {q.answer && !editing && (
        <div className="mt-4 rounded-xl border-l-4 border-accent-500 bg-accent-50 p-4 dark:bg-slate-900">
          <p className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">교수 답변{q.answeredAt ? ` · ${fmt(q.answeredAt)}` : ""}</p>
          <Markdown className="text-sm">{q.answer}</Markdown>
        </div>
      )}

      {isProfessor && (editing || !q.answer) && (
        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) void run(async () => { await questionService.answer(q.id, draft.trim()); setEditing(false); });
          }}
        >
          <label htmlFor={`a-${q.id}`} className="text-sm font-medium">답변 작성 (마크다운·수식 가능)</label>
          <textarea id={`a-${q.id}`} className={field} rows={4} maxLength={QUESTION_LIMITS.answer} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="flex gap-2">
            <button type="submit" className={btn} disabled={busy || !draft.trim()}>답변 저장</button>
            {editing && <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600" onClick={() => setEditing(false)}>취소</button>}
          </div>
        </form>
      )}

      <div className="mt-3 flex gap-3 text-sm">
        {isProfessor && q.answer && !editing && (
          <button type="button" className="text-navy-700 underline dark:text-navy-300" onClick={() => setEditing(true)}>답변 수정</button>
        )}
        {canDelete && (
          <button type="button" disabled={busy} className="text-red-700 underline dark:text-red-300"
            onClick={() => { if (window.confirm("이 질문을 삭제할까요?")) void run(() => questionService.remove(q.id)); }}>
            삭제
          </button>
        )}
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{err}</p>}
    </li>
  );
}

export default function Questions() {
  usePageMeta("질문 게시판", "수업·연구 관련 질문을 남기면 교수가 답변합니다. 구글 로그인이 필요합니다.");
  const { user } = useAuth();
  const [items, setItems] = useState<Question[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postErr, setPostErr] = useState("");

  const load = async (cur: string | null, append: boolean) => {
    setLoading(true);
    try {
      const page = await questionService.list({ pageSize: PAGE_SIZE, cursor: cur });
      setItems((prev) => (append ? [...prev, ...page.items] : page.items));
      setCursor(page.nextCursor);
      setError("");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  // 로그인한 경우에만 목록을 읽습니다 (읽기 한도 절약)
  useEffect(() => {
    if (user) void load(null, false);
    else { setItems([]); setCursor(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !body.trim()) return;
    setPosting(true);
    setPostErr("");
    try {
      await questionService.create(user, { course: course.trim() || undefined, title: title.trim(), body: body.trim() });
      setCourse(""); setTitle(""); setBody("");
      await load(null, false);
    } catch (err) {
      setPostErr(errorText(err));
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <PageHeader title="질문 게시판" subtitle="수업·연구에 대한 질문을 남겨 주세요. 수식은 $...$, 코드는 ``` 로 쓸 수 있습니다." />

      {!user ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
          <p className="font-medium">질문을 보거나 쓰려면 로그인이 필요합니다.</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">화면 위쪽의 <strong>로그인</strong> 버튼으로 구글 계정에 로그인해 주세요.</p>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="mb-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800">
            <h2 className="section-title">질문 쓰기</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">작성자 이름({user.name})이 다른 로그인 사용자에게 표시됩니다. 개인정보나 성적은 쓰지 마세요.</p>
            <div>
              <label htmlFor="q-course" className="text-sm font-medium">과목 (선택)</label>
              <input id="q-course" className={field} maxLength={50} value={course} onChange={(e) => setCourse(e.target.value)} placeholder="예: 시계열자료분석" />
            </div>
            <div>
              <label htmlFor="q-title" className="text-sm font-medium">제목</label>
              <input id="q-title" className={field} required maxLength={QUESTION_LIMITS.title} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="q-body" className="text-sm font-medium">내용</label>
              <textarea id="q-body" className={field} required rows={5} maxLength={QUESTION_LIMITS.body} value={body} onChange={(e) => setBody(e.target.value)} />
              <p className="mt-1 text-right text-xs text-slate-500">{body.length}/{QUESTION_LIMITS.body}</p>
            </div>
            <button type="submit" className={btn} disabled={posting || !title.trim() || !body.trim()}>{posting ? "등록 중…" : "질문 등록"}</button>
            {postErr && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{postErr}</p>}
          </form>

          {error && <ErrorBox message={error} />}
          {!error && !loading && items.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-600">아직 질문이 없습니다. 첫 질문을 남겨 보세요.</p>
          )}
          <ul className="space-y-4">
            {items.map((q) => <QuestionCard key={q.id} q={q} onChanged={() => load(null, false)} />)}
          </ul>
          {loading && <Loading />}
          {cursor && !loading && (
            <div className="mt-6 text-center">
              <button type="button" className="rounded-md border border-navy-600 px-5 py-2 text-navy-800 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-navy-800" onClick={() => load(cursor, true)}>더 보기</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
