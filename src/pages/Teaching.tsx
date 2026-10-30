import PageHeader from "../components/PageHeader";
import Markdown from "../components/Markdown";
import { ErrorBox, Loading } from "../components/ErrorBox";
import { useAsync } from "../hooks/useAsync";
import { usePageMeta } from "../hooks/usePageMeta";
import { dataService } from "../services";
import type { ResourceKind } from "../services/types";

const KIND: Record<ResourceKind, { label: string; cls: string }> = {
  slides: { label: "슬라이드", cls: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100" },
  "code-r": { label: "R", cls: "bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100" },
  "code-python": { label: "Python", cls: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100" },
  "code-sas": { label: "SAS", cls: "bg-violet-100 text-violet-900 dark:bg-violet-900 dark:text-violet-100" },
  data: { label: "데이터", cls: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100" },
  assignment: { label: "과제", cls: "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100" },
  other: { label: "기타", cls: "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100" },
};

export default function Teaching() {
  const { data, error } = useAsync(() => dataService.getCourses(), []);
  usePageMeta("수업", "학기별 과목, 주차별 슬라이드·실습 코드(R/Python/SAS)·데이터셋·과제와 공지사항.");

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <>
      <PageHeader title="수업" subtitle="학기별 과목과 주차별 자료" />

      <section aria-labelledby="ann-h" className="mb-12">
        <h2 id="ann-h" className="mb-3 text-xl font-bold text-navy-800 dark:text-navy-100">공지사항</h2>
        <ul className="space-y-3">
          {data.announcements.map((a) => (
            <li key={a.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex flex-wrap items-baseline gap-x-3 text-sm text-slate-500 dark:text-slate-400">
                <time dateTime={a.date}>{a.date}</time>
                {a.course && <span>{a.course}</span>}
              </div>
              <h3 className="font-semibold text-navy-900 dark:text-white">{a.title}</h3>
              <Markdown className="mt-1 text-sm">{a.body}</Markdown>
            </li>
          ))}
        </ul>
      </section>

      {data.semesters.map((s) => (
        <section key={s.term} className="mb-12" aria-labelledby={`t-${s.term}`}>
          <h2 id={`t-${s.term}`} className="mb-4 text-2xl font-bold text-navy-900 dark:text-navy-100">{s.term}</h2>
          <div className="space-y-6">
            {s.courses.map((c) => (
              <article key={c.code + c.name} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{c.code}</p>
                    <h3 className="text-xl font-bold text-navy-800 dark:text-white">{c.name}</h3>
                  </div>
                  {c.syllabusUrl && (
                    <a href={c.syllabusUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-navy-300 px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-navy-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-800">
                      강의계획서
                    </a>
                  )}
                </div>
                <p className="mt-2 text-sm">{c.description}</p>
                <ol className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
                  {c.weeks.map((w) => (
                    <li key={w.week} className="py-3 sm:flex sm:gap-4">
                      <div className="sm:w-56 sm:shrink-0">
                        <span className="font-semibold text-navy-700 dark:text-navy-200">{w.week}주차</span>
                        <p className="text-sm">{w.topic}</p>
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                        {w.resources.map((r) => (
                          <li key={r.label + r.url}>
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium hover:opacity-80 ${KIND[r.kind].cls}`}>
                              <span className="font-bold">{KIND[r.kind].label}</span>
                              <span>{r.label}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
