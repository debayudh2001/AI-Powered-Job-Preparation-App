const { prisma } = require('../config/prisma.client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { redis } = require('../config/redis.client')

async function registerController(req, res) {
    try {
        const { email, username, password } = req.body

        // Validate required fields
        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Email, username, and password are required' })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        })

        if (existingUser) {
            return res.status(409).json({ message: 'User with this email or username already exists' })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                createdAt: new Date()
            }
        })

        const token = jwt.sign({ 
            id: user.id,
            email: user.email,
            username: user.username
        }, 
        process.env.JWT_SECRET, 
        { 
            expiresIn: '1h' 
        })

        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 3600000,
            secure: true
        })

        return res.status(201).json({ 
            message: 'User registered successfully',
            user:{
                id: user.id,
                email: user.email,
                username: user.username
            }
        })

    } catch (error) {
        console.error('Registration error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

async function loginController(req, res) {
    try {
        const { email, password } = req.body

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        // Generate JWT
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        })

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000,
            secure: true
        })

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

async function logoutController(req, res) {
    try {
        const token = req.cookies?.token

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        // Decode the token to get the expiration time
        const decoded = jwt.decode(token)
        if (!decoded.email || !decoded.username) {
            return res.status(401).json({ message: 'Invalid token' })
        }

        // Calculate remaining time for the token to expire in seconds
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000)

        if (expiresIn > 0) {
            // Add token to Redis blacklist with the remaining time to live
            await redis.set(`bl_${token}`, token, { ex: expiresIn })
        }

        // Clear the cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: true
        })

        return res.status(200).json({ message: 'Logged out successfully' })

    } catch (error) {
        console.error('Logout error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

async function getUserInfo(req, res){
    try{
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        })
        if(!user){
            return res.status(404).json({ message: 'User not found' })
        }
        return res.status(200).json({
            message: 'User info fetched successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        })     
    }catch(err){
        console.error('Get user info error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

module.exports = {
    registerController,
    loginController,
    logoutController,
    getUserInfo
}


