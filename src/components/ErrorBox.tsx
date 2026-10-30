export function ErrorBox({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p className="font-semibold">자료를 표시할 수 없습니다</p>
      <p className="mt-1 text-sm leading-relaxed">{message}</p>
    </div>
  );
}

export function Loading() {
  return <p className="py-8 text-slate-500 dark:text-slate-400" role="status">불러오는 중…</p>;
}
