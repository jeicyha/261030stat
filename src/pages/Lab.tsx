import PageHeader from "../components/PageHeader";
import Markdown from "../components/Markdown";
import { ErrorBox, Loading } from "../components/ErrorBox";
import { useAsync } from "../hooks/useAsync";
import { usePageMeta } from "../hooks/usePageMeta";
import { dataService } from "../services";

export default function Lab() {
  const { data, error } = useAsync(() => dataService.getMembers(), []);
  usePageMeta("연구실", "연구실 현재 구성원, 졸업생, 대학원생 모집 안내.");

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <>
      <PageHeader title="연구실" subtitle="구성원과 대학원생 모집 안내" />

      <section aria-labelledby="rec-h" className="mb-10 rounded-xl border-2 border-navy-300 bg-navy-50 p-5 dark:border-navy-600 dark:bg-navy-900">
        <h2 id="rec-h" className="mb-2 flex items-center gap-2 text-xl font-bold text-navy-900 dark:text-white">
          대학원생 모집
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${data.recruiting.open ? "bg-emerald-200 text-emerald-900" : "bg-slate-300 text-slate-900"}`}>
            {data.recruiting.open ? "모집 중" : "현재 모집 안 함"}
          </span>
        </h2>
        <Markdown>{data.recruiting.body}</Markdown>
      </section>

      <section aria-labelledby="cur-h" className="mb-10">
        <h2 id="cur-h" className="mb-4 text-xl font-bold text-navy-800 dark:text-navy-100">현재 구성원</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.current.map((m) => (
            <li key={m.name} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="font-semibold text-navy-900 dark:text-white">{m.name}</p>
              <p className="text-sm text-navy-700 dark:text-navy-200">{m.role}{m.year ? ` · ${m.year} 입학` : ""}</p>
              {m.interest && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.interest}</p>}
              {m.email && <a className="mt-1 block text-sm text-navy-700 underline dark:text-navy-300" href={`mailto:${m.email}`}>{m.email}</a>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="alu-h">
        <h2 id="alu-h" className="mb-4 text-xl font-bold text-navy-800 dark:text-navy-100">졸업생</h2>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
          {data.alumni.map((a) => (
            <li key={a.name} className="flex flex-wrap gap-x-4 p-4 text-sm">
              <span className="font-semibold">{a.name}</span>
              <span>{a.degree} ({a.graduated})</span>
              {a.now && <span className="text-slate-600 dark:text-slate-300">{a.now}</span>}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
