const PageHeader = ({ eyebrow, title, description, children }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && (
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      )}
    </div>
    {children && (
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    )}
  </div>
);

export default PageHeader;