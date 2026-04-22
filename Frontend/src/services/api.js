import axios from 'axios'

const TOKEN_KEY = 'jwt_token'
const USER_KEY = 'task_user'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

export const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
]

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getStoredUser() {
  const storedUser = localStorage.getItem(USER_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function storeUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getErrorMessage(error, fallbackMessage = 'Request failed.') {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (item?.msg) {
          return item.msg
        }

        return JSON.stringify(item)
      })
      .join(', ')
  }

  if (detail && typeof detail === 'object') {
    if (typeof detail.msg === 'string') {
      return detail.msg
    }

    return JSON.stringify(detail)
  }

  return fallbackMessage
}

export function normalizeTaskStatus(status) {
  if (status === 'in_progress') {
    return 'running'
  }

  if (status === 'done') {
    return 'completed'
  }

  return status || 'pending'
}

export function toStatusLabel(status) {
  const normalizedStatus = normalizeTaskStatus(status)
  const matchedOption = TASK_STATUS_OPTIONS.find((option) => option.value === normalizedStatus)
  return matchedOption ? matchedOption.label : normalizedStatus
}

export async function registerUser(payload) {
  const response = await api.post('/auth/register', payload)
  return response.data
}

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload)
  return response.data
}

export async function fetchCurrentUser() {
  const response = await api.get('/auth/me')
  return response.data
}

export async function fetchTasks() {
  const response = await api.get('/tasks')
  return response.data
}

export async function createTask(payload) {
  const response = await api.post('/tasks', payload)
  return response.data
}

export async function updateTask(taskId, payload) {
  const response = await api.put(`/tasks/${taskId}`, payload)
  return response.data
}

export async function deleteTask(taskId) {
  const response = await api.delete(`/tasks/${taskId}`)
  return response.data
}
