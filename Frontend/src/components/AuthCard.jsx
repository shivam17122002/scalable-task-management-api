function AuthCard({
  title,
  subtitle,
  error,
  success,
  onSubmit,
  submitLabel,
  children,
  footer,
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

      {error ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {children}
        <button
          className="w-full rounded bg-[#468432] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d742b]"
          type="submit"
        >
          {submitLabel}
        </button>
      </form>

      <div className="mt-4 text-sm text-slate-600">{footer}</div>
    </div>
  )
}

export default AuthCard
