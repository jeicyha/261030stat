export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-3xl">{title}</h1>
      <div className="mt-2 h-1 w-14 rounded-full bg-gradient-to-r from-accent-500 to-navy-500" aria-hidden="true" />
      {subtitle && <p className="mt-3 text-slate-600 dark:text-slate-300">{subtitle}</p>}
    </header>
  );
}
