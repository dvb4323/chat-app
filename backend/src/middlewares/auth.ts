import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/authUtils'

export interface AuthRequest extends Request {
  userId?: number
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' })
    return
  }

  const payload = verifyToken(token)
  if (!payload) {
    res.status(403).json({ error: 'Invalid or expired token' })
    return
  }

  req.userId = payload.userId
  next()
}
