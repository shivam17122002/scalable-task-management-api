import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import { createTask, fetchTasks, deleteTask, getErrorMessage, updateTask } from '../services/api'

function DashboardPage({ onLogout, user }) {
  const navigate = useNavigate()
  const [taskTitle, setTaskTitle] = useState('')
  const [taskStatus, setTaskStatus] = useState('pending')
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [creatingTask, setCreatingTask] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState(null)
  const [savingTaskId, setSavingTaskId] = useState(null)
  const canManageStatus = user?.role === 'admin'

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  const isAuthFailure = (requestError) =>
    requestError.response?.status === 401 || requestError.response?.status === 403

  const loadTasks = async () => {
    setError('')
    setLoadingTasks(true)

    try {
      const response = await fetchTasks()
      setTasks(response)
    } catch (requestError) {
      if (isAuthFailure(requestError)) {
        handleLogout()
        return
      }

      setError(getErrorMessage(requestError, 'Failed to fetch tasks.'))
    } finally {
      setLoadingTasks(false)
    }
  }

  useEffect(() => {
    const loadInitialTasks = async () => {
      setError('')
      setLoadingTasks(true)

      try {
        const response = await fetchTasks()
        setTasks(response)
      } catch (requestError) {
        if (isAuthFailure(requestError)) {
          onLogout()
          navigate('/login', { replace: true })
          return
        }

        setError(getErrorMessage(requestError, 'Failed to fetch tasks.'))
      } finally {
        setLoadingTasks(false)
      }
    }

    loadInitialTasks()
  }, [navigate, onLogout])

  const handleCreateTask = async (event) => {
    event.preventDefault()

    if (!taskTitle.trim()) {
      return
    }

    setError('')
    setCreatingTask(true)

    try {
      const payload = { title: taskTitle.trim() }
      if (canManageStatus) {
        payload.status = taskStatus
      }

      await createTask(payload)
      setTaskTitle('')
      setTaskStatus('pending')
      await loadTasks()
    } catch (requestError) {
      if (isAuthFailure(requestError)) {
        handleLogout()
        return
      }

      setError(getErrorMessage(requestError, 'Failed to create task.'))
    } finally {
      setCreatingTask(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    setError('')
    setDeletingTaskId(taskId)

    try {
      await deleteTask(taskId)
      setTasks((current) => current.filter((task) => task.id !== taskId))
    } catch (requestError) {
      if (isAuthFailure(requestError)) {
        handleLogout()
        return
      }

      setError(getErrorMessage(requestError, 'Failed to delete task.'))
    } finally {
      setDeletingTaskId(null)
    }
  }

  const handleUpdateTask = async (task, nextTitle, nextStatus) => {
    setError('')
    setSavingTaskId(task.id)

    try {
      const payload = {
        title: nextTitle,
        description: task.description ?? null,
      }
      if (canManageStatus) {
        payload.status = nextStatus
      }

      const updatedTask = await updateTask(task.id, payload)
      setTasks((current) =>
        current.map((currentTask) => (currentTask.id === task.id ? updatedTask : currentTask)),
      )
    } catch (requestError) {
      if (isAuthFailure(requestError)) {
        handleLogout()
        return
      }

      setError(getErrorMessage(requestError, 'Failed to update task.'))
    } finally {
      setSavingTaskId(null)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4 rounded-lg bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-700">
              {user ? `Logged in as ${user.full_name} (${user.role})` : 'Loading account...'}
            </p>
          </div>
          <button
            className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>

        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">Create task</h2>
          <div className="mt-4">
            <TaskForm
              canManageStatus={canManageStatus}
              loading={creatingTask}
              onChange={(event) => setTaskTitle(event.target.value)}
              onStatusChange={(event) => setTaskStatus(event.target.value)}
              onSubmit={handleCreateTask}
              status={taskStatus}
              value={taskTitle}
            />
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-900">Tasks</h2>
            <button
              className="text-sm font-medium text-[#468432] hover:underline"
              onClick={loadTasks}
              type="button"
            >
              Refresh
            </button>
          </div>

          {loadingTasks ? (
            <p className="text-sm text-slate-600">Loading tasks...</p>
          ) : (
            <TaskList
              canManageStatus={canManageStatus}
              deletingTaskId={deletingTaskId}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
              savingTaskId={savingTaskId}
              tasks={tasks}
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
