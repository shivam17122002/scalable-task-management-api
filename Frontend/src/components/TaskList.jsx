import { useState } from 'react'
import { TASK_STATUS_OPTIONS, normalizeTaskStatus, toStatusLabel } from '../services/api'

function TaskList({ tasks, deletingTaskId, savingTaskId, onDelete, onUpdate, canManageStatus }) {
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingStatus, setEditingStatus] = useState('pending')

  const startEditing = (task) => {
    setEditingTaskId(task.id)
    setEditingTitle(task.title)
    setEditingStatus(normalizeTaskStatus(task.status))
  }

  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditingTitle('')
    setEditingStatus('pending')
  }

  const submitUpdate = async (task) => {
    if (!editingTitle.trim()) {
      return
    }

    const nextTitle = editingTitle.trim()
    await onUpdate(task, nextTitle, editingStatus)
    cancelEditing()
  }

  if (!tasks.length) {
    return <p className="text-sm text-slate-600">No tasks found.</p>
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-4 py-3"
          key={task.id}
        >
          <div className="min-w-0 flex-1">
            {editingTaskId === task.id ? (
              <div className="space-y-2">
                <input
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#468432]"
                  onChange={(event) => setEditingTitle(event.target.value)}
                  value={editingTitle}
                />
                {canManageStatus ? (
                  <select
                    className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#468432]"
                    onChange={(event) => setEditingStatus(event.target.value)}
                    value={editingStatus}
                  >
                    {TASK_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-900">{task.title}</p>
            )}
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {toStatusLabel(task.status)}
            </p>
          </div>
          <div className="ml-4 flex shrink-0 gap-2">
            {editingTaskId === task.id ? (
              <>
                <button
                  className="rounded border border-[#468432] px-3 py-1 text-sm text-[#468432] hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={savingTaskId === task.id}
                  onClick={() => submitUpdate(task)}
                  type="button"
                >
                  {savingTaskId === task.id ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={cancelEditing}
                  type="button"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => startEditing(task)}
                type="button"
              >
                Edit
              </button>
            )}
            <button
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={deletingTaskId === task.id}
              onClick={() => onDelete(task.id)}
              type="button"
            >
              {deletingTaskId === task.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default TaskList
