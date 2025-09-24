import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  console.log('🔍 Raw auth header:', authHeader)
  console.log('🔍 Extracted token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN')

  if (!token) {
    return res.status(401).json({ error: '⚠️ Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('❌ JWT verification failed:', err.message)
      console.log('❌ Token causing error:', token.substring(0, 50) + '...')
      return res.status(401).json({ error: '⚠️ Invalid or expired token' })
    }
    
        // Debug: log the decoded token to see its structure
    console.log('🔍 Decoded JWT payload:', decoded)

    // Fix: Handle different possible field names for user ID
    const userId = decoded.userId || decoded.id || decoded.sub

    if (!userId) {
      console.log('❌ No user ID found in token payload')
      return res.status(403).json({ error: '⚠️ Invalid token payload' })
    }

    req.user = { id: userId, userId: userId, ...decoded }
    console.log('✅ User authenticated:', req.user.id)
    next()
  })
}
