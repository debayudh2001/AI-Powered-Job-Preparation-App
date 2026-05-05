import { createContext, useState, useEffect } from "react";
import { getCurrentUser } from "./services/auth.api.js";

export const AuthContext =  createContext()


export default function AuthProvider({ children }){
    const [ user, setUser ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    
    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await getCurrentUser()
                setUser(response.user)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        checkUser()
    }, [])
    
    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}
