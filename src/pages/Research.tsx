import Markdown from "../components/Markdown";
import PageHeader from "../components/PageHeader";
import { ErrorBox, Loading } from "../components/ErrorBox";
import { useAsync } from "../hooks/useAsync";
import { usePageMeta } from "../hooks/usePageMeta";
import { dataService } from "../services";

export default function Research() {
  const { data, error } = useAsync(() => dataService.getProfile(), []);
  usePageMeta("연구", "시계열분석 등 연구 주제와 진행 중인 프로젝트를 소개합니다.");

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <>
      <PageHeader title="연구" subtitle="연구 주제와 진행 중인 프로젝트" />
      <div className="space-y-10">
        {data.researchAreas.map((t) => (
          <section key={t.title} className="rounded-2xl border border-slate-200 bg-white shadow-soft p-5 dark:border-slate-700 dark:bg-slate-800 sm:p-6">
            <h2 className="section-title mb-3">{t.title}</h2>
            <Markdown>{t.body}</Markdown>
          </section>
        ))}
      </div>

      <section className="mt-12" aria-labelledby="proj-h">
        <h2 id="proj-h" className="mb-4 text-2xl font-bold text-navy-900 dark:text-navy-100">프로젝트</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.projects.map((pr) => (
            <li key={pr.title} className="card-hover rounded-2xl border border-slate-200 bg-white shadow-soft p-5 dark:border-slate-700 dark:bg-slate-800">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${pr.status === "진행 중" ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100" : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"}`}>{pr.status}</span>
              <h3 className="mt-2 font-semibold text-navy-900 dark:text-white">{pr.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{pr.period}{pr.funder ? ` · ${pr.funder}` : ""}</p>
              <p className="mt-2 text-sm">{pr.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
