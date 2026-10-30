import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { usePageMeta } from "../hooks/usePageMeta";

export default function NotFound() {
  usePageMeta("페이지를 찾을 수 없음", "요청하신 페이지가 없습니다.");
  return (
    <>
      <PageHeader title="페이지를 찾을 수 없습니다" />
      <p>주소를 다시 확인하시거나 <Link className="text-navy-700 underline dark:text-navy-300" to="/">홈으로</Link> 이동해 주세요.</p>
    </>
  );
}
