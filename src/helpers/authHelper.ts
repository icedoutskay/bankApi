import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import {User}  from '../Models/user.model.js'
import { verifyAccessToken } from './jwt_helper.js'  

declare module 'express-serve-static-core' {
  interface Request {
    user?: any
  }
}
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) throw createError.Unauthorized('No token provided')

    const token = authHeader.split(' ')[1]
    if (!token) throw createError.Unauthorized('Missing Bearer token')

    // Verify token and get payload
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload

    // Find user by ID in payload (audience)
    const user = await User.findById(payload.aud)
    if (!user) throw createError.Unauthorized('Invalid token user')

    req.user = user
    next()
  } catch (err) {
    console.error('Auth error:', (err as Error).message)
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

// 👑 Authorization middleware (role-based)
export const authorize =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' })
    }
    next()
  }