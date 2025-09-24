import prisma from './prisma.js'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA4v3KIBKEVUhM47L7hAb71EPqkk8XW/dCzaLVbQH4xQnwbIBRMR3aW34MQAuQmRhICnVSDcbgSaPeG3LwSRm93QIDAQABAkA7lIXjWTjm8a1M7wPZqcOb+Z+ue5gUCZi9RQpkLGpRvUVylm80TWwB+XOwFiwPRqWEDLftObTVvd1FQr/R/bG5AiEA/D7CsGPiINS/z1m+pAAb0g5SXxmKKV5no16ZLvfqtp8CIQDmXssk4h5IlL1/smTpa8s/zdmcZrcDiiJ/kKaawwImAwIgXQQruO3sSh0J6kV21nUvzSL43xbE6wJkB0twA3DqfZMCIQCCxd8F4gKU6zKjkc5tH07yulVEzp4nuTuaNLAO/JJ0pwIgUMCclu0dWZRxmWPDVlriivaZmL/7XPL48S1Mcc7OdLI='
const ACCESS_SECRET = process.env.JWT_SECRET || 'yo$6$5daUcgvHTC/hcHiD$Mdv9JEBNNEoDWXB0h0G.g.iXrHjOb253Bj0tNR/yU732jjjNPRIXzJiPup9kEBMACfJyy9ncFZ/B8raR5FKjd1ur_jwt_secret'

export const generateTokens = async (userId) => {
  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    {
      userId: userId, // Primary field
      id: userId,     // Legacy compatibility
      sub: userId     // Standard JWT subject field
    },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  )
  
  // Generate refresh token (long-lived)
  const refreshToken = randomBytes(64).toString('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  
  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    }
  })
  
  return { accessToken, refreshToken }
}

export const refreshAccessToken = async (refreshToken) => {
  // Find and validate refresh token
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  })
  
  if (!tokenRecord || tokenRecord.revoked || new Date() > tokenRecord.expiresAt) {
    throw new Error('⚠️ Invalid refresh token')
  }
  
  // Revoke old refresh token (rotation)
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revoked: true }
  })
  
  // Generate new tokens
  return generateTokens(tokenRecord.userId)
}

export const revokeRefreshToken = async (refreshToken) => {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true }
  })
}

export const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true }
  })
}
