import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { ErrorBox, Loading } from "../components/ErrorBox";
import { useAsync } from "../hooks/useAsync";
import { usePageMeta } from "../hooks/usePageMeta";
import { dataService } from "../services";

export default function Contact() {
  const { data, error } = useAsync(() => dataService.getProfile(), []);
  usePageMeta("연락처", "이메일, 연구실 위치, 면담 가능 시간 안내.");

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const rows: [string, React.ReactNode][] = [
    ["이메일", <a className="text-navy-700 underline dark:text-navy-300" href={`mailto:${data.email}`}>{data.email}</a>],
    ["연구실 위치", <>{data.office}{data.mapUrl && <> · <a className="text-navy-700 underline dark:text-navy-300" href={data.mapUrl} target="_blank" rel="noopener noreferrer">지도 보기</a></>}</>],
    ["면담 가능 시간", <>{data.officeHours} · <Link className="text-navy-700 underline dark:text-navy-300" to="/consult">상담 신청하기</Link></>],
  ];

  return (
    <>
      <PageHeader title="연락처" subtitle={`${data.name} · ${data.affiliation}`} />
      <dl className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-soft dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
        {rows.map(([k, v]) => (
          <div key={k} className="p-4 sm:flex sm:gap-6">
            <dt className="font-semibold text-navy-800 dark:text-navy-100 sm:w-40">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
