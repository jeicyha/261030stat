import { Link } from "react-router-dom";
import Markdown from "../components/Markdown";
import { ErrorBox, Loading } from "../components/ErrorBox";
import { useAsync } from "../hooks/useAsync";
import { usePageMeta } from "../hooks/usePageMeta";
import { dataService } from "../services";

export default function Home() {
  const profile = useAsync(() => dataService.getProfile(), []);
  const updates = useAsync(() => dataService.getUpdates({ pageSize: 5 }), []);
  usePageMeta("", profile.data ? `${profile.data.name} · ${profile.data.affiliation} — ${profile.data.tagline}` : "교수 연구·수업 자료 사이트");

  if (profile.error) return <ErrorBox message={profile.error} />;
  if (!profile.data) return <Loading />;
  const p = profile.data;
  const ext = [
    ["Google Scholar", p.links.googleScholar],
    ["ORCID", p.links.orcid],
    ["GitHub", p.links.github],
  ].filter(([, u]) => u);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-700 to-accent-700 p-6 text-white shadow-soft sm:p-10 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <img src={p.photo} alt={p.photoAlt} width={176} height={176} className="relative h-40 w-40 shrink-0 rounded-full border-4 border-white/80 object-cover shadow-xl sm:h-44 sm:w-44" />
        <div className="relative text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {p.name} <span className="text-xl font-normal text-navy-100">{p.title}</span>
          </h1>
          <p className="mt-1 text-navy-100">{p.affiliation}</p>
          <p className="mt-4 text-lg leading-relaxed text-white/95">{p.tagline}</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start" aria-label="연구 관심사">
            {p.keywords.map((k) => (
              <li key={k} className="rounded-full bg-white/15 px-3 py-1 text-sm text-white ring-1 ring-white/30 backdrop-blur">{k}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm sm:justify-start">
            <a className="font-medium text-white underline underline-offset-2" href={`mailto:${p.email}`}>{p.email}</a>
            {ext.map(([label, url]) => (
              <a key={label} className="text-white underline underline-offset-2" href={url} target="_blank" rel="noopener noreferrer">{label}</a>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="bio-h">
        <h2 id="bio-h" className="section-title mb-3">소개</h2>
        <Markdown>{p.bio}</Markdown>
      </section>

      <section aria-labelledby="news-h">
        <h2 id="news-h" className="section-title mb-3">최근 소식</h2>
        {updates.error && <ErrorBox message={updates.error} />}
        {updates.loading && <Loading />}
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-soft dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
          {updates.data?.items.map((u) => (
            <li key={u.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
              <time dateTime={u.date} className="shrink-0 text-sm text-slate-500 dark:text-slate-400 sm:w-28">{u.date}</time>
              <div>
                {u.url ? (
                  u.url.startsWith("/") ? <Link className="font-medium text-navy-700 hover:underline dark:text-navy-200" to={u.url}>{u.title}</Link>
                    : <a className="font-medium text-navy-700 hover:underline dark:text-navy-200" href={u.url} target="_blank" rel="noopener noreferrer">{u.title}</a>
                ) : <span className="font-medium">{u.title}</span>}
                {u.body && <Markdown className="mt-1 text-sm">{u.body}</Markdown>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
