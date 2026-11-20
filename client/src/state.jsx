import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
const Ctx = createContext(null)
export function AuthProvider({children}) {
  const [user,setUser] = useState(null), [loading,setLoading] = useState(true)
  useEffect(() => onAuthStateChanged(auth, u => {setUser(u); setLoading(false)}), [])
  return <Ctx.Provider value={{user,loading}}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
