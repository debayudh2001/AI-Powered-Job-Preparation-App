const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth')
const { registerController, loginController, logoutController, getUserInfo } = require('../controllers/auth.controller')
const passport = require('passport')
const jwt = require('jsonwebtoken')

router.post('/register', registerController)
router.post('/login', loginController)
router.get('/logout', logoutController)
router.get('/user', authMiddleware, getUserInfo)

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
    const token = jwt.sign({
        id: req.user.id,
        email: req.user.email,
        username: req.user.username
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

    const frontendUrl = process.env.FRONTEND_URL
    return res.redirect(`${frontendUrl}/`)
})

module.exports = router


