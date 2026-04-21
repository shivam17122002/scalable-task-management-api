function FormInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#468432]"
        {...props}
      />
    </label>
  )
}

export default FormInput
