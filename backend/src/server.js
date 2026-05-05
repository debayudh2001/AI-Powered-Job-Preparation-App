require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000
const authRoutes = require('./routes/auth.routes')
const interviewRoutes = require('./routes/interview.routes')
const { prisma } = require('./config/prisma.client')
const { redis } = require('./config/redis.client')
const passport = require('./config/passport')
const helmet = require('helmet')

app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())

app.use('/api/auth', authRoutes)
app.use('/api/interview', interviewRoutes)

const startServer = async () => {
    try {
        await prisma.$connect()
        console.log('Prisma database connection established successfully.')

        await redis.ping()
        console.log('Redis connection established successfully.')

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Failed to start the server due to connection issues:', error)
        process.exit(1)
    }
}

startServer()



