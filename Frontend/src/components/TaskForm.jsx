import { TASK_STATUS_OPTIONS } from '../services/api'

function TaskForm({ status, value, onChange, onStatusChange, onSubmit, loading, canManageStatus }) {
  return (
    <form className="flex gap-3" onSubmit={onSubmit}>
      <input
        className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#468432]"
        onChange={onChange}
        placeholder="Enter task title"
        value={value}
      />
      {canManageStatus ? (
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#468432]"
          onChange={onStatusChange}
          value={status}
        >
          {TASK_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
      <button
        className="rounded bg-[#FFA02E] px-4 py-2 text-sm font-medium text-white hover:bg-[#f28f17] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
        type="submit"
      >
        {loading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  )
}

export default TaskForm
