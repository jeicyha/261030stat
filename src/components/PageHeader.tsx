export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-8 border-b border-slate-200 pb-4 dark:border-slate-700">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-navy-100 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-600 dark:text-slate-300">{subtitle}</p>}
    </header>
  );
}
