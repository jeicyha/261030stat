import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { ErrorBox, Loading } from "../components/ErrorBox";
import { usePageMeta } from "../hooks/usePageMeta";
import { dataService } from "../services";
import { DataError } from "../services/jsonDataService";
import type { Publication, PublicationType } from "../services/types";

const TYPES: { value: PublicationType | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "paper", label: "논문" },
  { value: "preprint", label: "프리프린트" },
  { value: "slides", label: "발표자료" },
  { value: "code", label: "코드·데이터" },
];
const TYPE_LABEL: Record<PublicationType, string> = { paper: "논문", preprint: "프리프린트", slides: "발표자료", code: "코드·데이터" };
const PAGE_SIZE = 8;

/** bibtex 항목이 없으면 기본 정보로 자동 생성 */
export function makeBibtex(p: Publication): string {
  if (p.bibtex) return p.bibtex;
  const first = (p.authors[0] ?? "author").replace(/\s+/g, "");
  const kind = p.type === "paper" ? "article" : p.type === "preprint" ? "unpublished" : "misc";
  const lines = [
    `  title = {${p.title}}`,
    `  author = {${p.authors.join(" and ")}}`,
    `  year = {${p.year}}`,
    p.venue && `  journal = {${p.venue}}`,
    p.doi && `  doi = {${p.doi}}`,
  ].filter(Boolean);
  return `@${kind}{${first}${p.year},\n${lines.join(",\n")}\n}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { /* 무시 */ }
    document.body.removeChild(ta);
    return ok;
  }
}

const linkBtn = "inline-block rounded-md border border-navy-300 px-2.5 py-1 text-xs font-medium text-navy-800 hover:bg-navy-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-800";

function PubItem({ p }: { p: Publication }) {
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const copy = async () => {
    setCopied((await copyText(makeBibtex(p))) ? "ok" : "fail");
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-navy-100 px-2 py-0.5 font-medium text-navy-800 dark:bg-navy-800 dark:text-navy-100">{TYPE_LABEL[p.type]}</span>
        {p.keywords?.map((k) => <span key={k} className="text-slate-500 dark:text-slate-400">#{k}</span>)}
      </div>
      <h3 className="mt-2 font-semibold text-navy-900 dark:text-white">{p.title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.authors.join(", ")}</p>
      <p className="text-sm italic text-slate-500 dark:text-slate-400">{p.venue}</p>
      {p.abstract && <p className="mt-2 text-sm">{p.abstract}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {p.doi && <a className={linkBtn} href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer">DOI</a>}
        {p.pdfUrl && <a className={linkBtn} href={p.pdfUrl} target="_blank" rel="noopener noreferrer">PDF</a>}
        {p.githubUrl && <a className={linkBtn} href={p.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>}
        <button type="button" className={linkBtn} onClick={copy}>BibTeX 복사</button>
        <span role="status" aria-live="polite" className="text-xs text-emerald-700 dark:text-emerald-300">
          {copied === "ok" && "복사되었습니다 ✓"}
          {copied === "fail" && <span className="text-red-700 dark:text-red-300">복사에 실패했습니다</span>}
        </span>
      </div>
    </li>
  );
}

export default function Publications() {
  usePageMeta("논문·자료", "논문, 프리프린트, 발표자료, 코드·데이터 목록. 유형 필터와 키워드 검색, BibTeX 복사를 지원합니다.");
  const [type, setType] = useState<PublicationType | "all">("all");
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<Publication[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // 입력이 멈추면 검색어 반영
  useEffect(() => {
    const t = setTimeout(() => setKeyword(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  const fetchPage = async (cur: string | null, append: boolean) => {
    setLoading(true);
    try {
      const page = await dataService.getPublications({ type, keyword, pageSize: PAGE_SIZE, cursor: cur });
      setItems((prev) => (append ? [...prev, ...page.items] : page.items));
      setCursor(page.nextCursor);
      setTotal(page.total ?? page.items.length);
      setError(undefined);
    } catch (e) {
      setError(e instanceof DataError ? e.message : "자료를 불러오는 중 문제가 생겼습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPage(null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, keyword]);

  const years = [...new Set(items.map((i) => i.year))];

  return (
    <>
      <PageHeader title="논문·자료" subtitle="연도별 목록입니다. 유형을 고르거나 키워드로 검색해 보세요." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="유형 필터" className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={type === t.value}
              onClick={() => setType(t.value)}
              className={`rounded-full border px-3 py-1 text-sm ${type === t.value ? "border-navy-700 bg-navy-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="pub-search" className="sr-only">키워드 검색</label>
          <input
            id="pub-search"
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="제목·저자·키워드 검색"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 sm:w-64"
          />
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {!error && (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400" role="status">총 {total}건</p>
      )}
      {!error && !loading && items.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-600">조건에 맞는 자료가 없습니다.</p>
      )}

      {years.map((y) => (
        <section key={y} className="mb-8" aria-labelledby={`y-${y}`}>
          <h2 id={`y-${y}`} className="mb-3 text-xl font-bold text-navy-800 dark:text-navy-100">{y}</h2>
          <ul className="space-y-3">
            {items.filter((i) => i.year === y).map((p) => <PubItem key={p.id} p={p} />)}
          </ul>
        </section>
      ))}

      {loading && <Loading />}
      {cursor && !loading && (
        <div className="text-center">
          <button type="button" onClick={() => fetchPage(cursor, true)} className="rounded-md border border-navy-600 px-5 py-2 text-navy-800 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-navy-800">
            더 보기
          </button>
        </div>
      )}
    </>
  );
}
