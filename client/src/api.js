import { auth } from './firebase'
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function request(path, options = {}) {
  const user = auth.currentUser
  const token = user ? await user.getIdToken() : null
  const headers = { ...(options.body ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:`Bearer ${token}`} : {}), ...options.headers }
  const res = await fetch(`${API}${path}`, {...options, headers})
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}
