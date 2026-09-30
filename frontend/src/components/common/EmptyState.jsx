const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="w-full max-w-lg rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm">
      {Icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h2 className="mt-5 text-2xl font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  </div>
);

export default EmptyState;