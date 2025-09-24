import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js';
import { generateTokens, refreshAccessToken, revokeRefreshToken } from '../lib/refreshToken.js'

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existingUser = await prisma.user.findUnique({ where: { email } }) // Check if user already exists
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
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
    console.error('⚠️ Registration error:', error)
    res.status(400).json({ error: '❌ Registration failed' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Debug logging
    console.log('🔍 Login attempt for: ✉️ ', email)
    
    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
  
    if (!user) {
      return res.status(401).json({ error: '⚠️ Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: '⚠️ Invalid credentials' })
    }
    
    const { accessToken, refreshToken } = await generateTokens(user.id)

    // Debug logging
    console.log('✅ Tokens generated:', { 
      accessToken: accessToken.substring(0, 20) + '...', 
      refreshToken: refreshToken.substring(0, 20) + '...' 
    })

    // Verify password
    
    // Create JWT token
    // const token = jwt.sign(
    //   { sub: user.id, email: user.email },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '60m' }
    // )
    const response = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      accessToken,
      refreshToken
    }

    console.log('📤 Sending response:', { ...response, accessToken: '...', refreshToken: '...' })

    res.json({ response })
  } catch (error) {
    console.error('⚠️ Login error:', error)
    res.status(500).json({ error: '❌ Login failed' })
  }
})

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' })
    }

    const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken)

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    console.error('⚠️ Token refresh error:', error)
    res.status(401).json({ error: '❌ Invalid refresh token' })
  }
})

// LOGOUT - Updated to revoke refresh token
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body
    
    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }
    
    res.json({ message: '✅ Logged out successfully' })
  } catch (error) {
    console.error('⚠️ Logout error:', error)
    res.status(500).json({ error: '❌ Logout failed' })
  }
})

export default router