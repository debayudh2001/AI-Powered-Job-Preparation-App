const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { prisma } = require('./prisma.client')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
        const email = profile.emails[0].value
        
        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            // Generate a random password since they are signing in with Google
            const randomPassword = crypto.randomBytes(16).toString('hex')
            const hashedPassword = await bcrypt.hash(randomPassword, 10)
            
            // Generate a base username from their email or name
            let baseUsername = profile.displayName ? profile.displayName.replace(/\s+/g, '').toLowerCase() : email.split('@')[0]
            
            // Ensure unique username
            let username = baseUsername
            let counter = 1
            while (await prisma.user.findUnique({ where: { username } })) {
                username = `${baseUsername}${counter}`
                counter++
            }

            // Create the new user
            user = await prisma.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    createdAt: new Date()
                }
            })
        }

        return cb(null, user)

    } catch (err) {
        console.error('Google Auth Error:', err)
        return cb(err, null)
    }
  }
))

module.exports = passport
