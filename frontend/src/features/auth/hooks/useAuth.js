import { useContext } from "react"
import { AuthContext } from "../auth.context"
import { register, login, logout } from "../services/auth.api.js"


export const useAuth = () => {
    const { user, setUser, loading, setLoading } = useContext(AuthContext)

    const handleRegister = async (userData) => {
        setLoading(true)
        try {
            const response = await register(userData)
            setUser(response.user)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (userData) => {
        setLoading(true)
        try {
            const response = await login(userData)
            setUser(response.user)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout
    }
}