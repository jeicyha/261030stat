export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      <p>© {new Date().getFullYear()} 하정철 · 계명대학교 통계학과</p>
    </footer>
  );
}
