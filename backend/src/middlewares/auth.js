const jwt = require('jsonwebtoken')
const { redis } = require('../config/redis.client')

const authMiddleware = async (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded.email || !decoded.username) {
            return res.status(401).json({ message: 'Invalid token' })
        }
        const bl_token = await redis.get(`bl_${token}`)
        if(bl_token){
            return res.status(401).json({ message: 'Token has been blacklisted' })
        }
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' })
    }
}

module.exports = authMiddleware


