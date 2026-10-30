import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { usePageMeta } from "../hooks/usePageMeta";

// 교수 전용 "관리" 페이지 자리입니다. (지금은 비어 있음)
// 나중에 Firebase 연동 후 이곳에 글쓰기·수정 화면을 추가합니다.
export default function Admin() {
  const { isProfessor } = useAuth();
  usePageMeta("관리", "교수 전용 관리 페이지");

  if (!isProfessor) {
    return (
      <>
        <PageHeader title="접근 권한이 없습니다" />
        <p>이 페이지는 교수 계정으로 로그인했을 때만 볼 수 있습니다. <Link className="text-navy-700 underline dark:text-navy-300" to="/">홈으로 돌아가기</Link></p>
      </>
    );
  }
  return (
    <>
      <PageHeader title="관리" subtitle="교수 전용 영역 (준비 중)" />
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-600 dark:text-slate-400">
        Firebase 연동 후 이곳에서 소식·공지·자료를 직접 수정할 수 있게 됩니다.
      </p>
    </>
  );
}
