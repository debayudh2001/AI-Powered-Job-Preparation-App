import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
})

export async function login({ email, password }){
    try {
        const response = await api.post(`/auth/login`, {email, password})
        return response.data
    } catch (error) {
        throw error
    }
}

export async function register({ username, email, password }){
    try {
        const response = await api.post(`/auth/register`, {username, email, password})
        return response.data
    } catch (error) {
        throw error
    }
}

export async function logout(){
    try {
        const response = await api.get(`/auth/logout`)
        return response.data
    } catch (error) {
        throw error
    }
}

export async function getCurrentUser(){
    try {
        const response = await api.get(`/auth/user`)
        return response.data
    } catch (error) {
        throw error
    }
}