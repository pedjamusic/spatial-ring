import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existingUser = await prisma.user.findUnique({ where: { email } }) // Check if user already exists
    if (existingUser) {
      return res.status(400).json({ error: '[API routes auth] ⚠️ User already exists' })
    }
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_COST || '12')
    const passwordHash = await bcrypt.hash(password, saltRounds)
    // Create user
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    })
    
    res.status(201).json({ 
      id: user.id, 
      name: user.name, 
      email: user.email 
    })
  } catch (error) {
    console.error('[API routes auth]⚠️ Registration error:', error)
    res.status(400).json({ error: '[API routes auth] ❌ Registration failed' })
  }
})

// Login user - SIMPLE VERSION
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
  
    if (!user) {
      return res.status(401).json({ error: '[API routes auth] ⚠️ Invalid credentials' })
    }
    
    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: '[API routes auth] ⚠️ Invalid credentials' })
    }
    
    // Create simple JWT token (60 minutes)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret',
      { expiresIn: '60m' }
    )
    
    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token // Simple token field
    })
  } catch (error) {
    console.error('[API routes auth] ⚠️ Login error:', error)
    res.status(500).json({ error: '[API routes auth] ❌ Login failed' })
  }
})

// LOGOUT - Updated to revoke refresh token
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body
    
    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }

    res.json({ message: '[API routes auth] ✅ Logged out successfully' })
  } catch (error) {
    console.error('[API routes auth] ⚠️ Logout error:', error)
    res.status(500).json({ error: '[API routes auth] ❌ Logout failed' })
  }
})

export default router
