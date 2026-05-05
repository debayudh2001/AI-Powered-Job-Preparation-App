import { Navigate } from "react-router"
import { useAuth } from "../hooks/useAuth"


export default function Protected({ children }){
    const { user, loading } = useAuth()

    if(loading){
        return <main className="auth-main"><div className="loader-container"><h1>Loading...</h1></div></main>
    }

    if(!user){
        return <Navigate to="/login" />
    }

    return children
}

