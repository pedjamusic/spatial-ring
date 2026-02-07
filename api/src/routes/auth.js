import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const JWT_SECRET = process.env.JWT_SECRET
const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const saltRounds = parseInt(process.env.BCRYPT_COST || '12')
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    })

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email
    })
  } catch (error) {
    console.error('Registration error:', error.message)
    res.status(400).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '60m' }
    )

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/logout', async (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

export default router
