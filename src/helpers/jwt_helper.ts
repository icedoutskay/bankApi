import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import redisClient from './init_redis'
import type { Request, Response, NextFunction } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    payload?: string | jwt.JwtPayload
  }
}

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string

const ACCESS_EXPIRES_IN = '1h'
const REFRESH_EXPIRES_IN = '1w'

export async function signAccessToken(userId: string): Promise<string> {
  try {
    const payload = {}
    const options: jwt.SignOptions = {
      expiresIn: ACCESS_EXPIRES_IN,
      issuer: 'pickurpage.com',
      audience: userId,
    }

    const token = jwt.sign(payload, ACCESS_SECRET, options)
    return token
  } catch (err) {
    console.error('Error signing access token:', (err as Error).message)
    throw createError.InternalServerError()
  }
}

export function verifyAccessToken(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization']
    if (!authHeader) throw createError.Unauthorized()

    const [, token] = authHeader.split(' ')
    if (!token) throw createError.Unauthorized()

    jwt.verify(token, ACCESS_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
        return next(createError.Unauthorized(message))
      }
      req.payload = payload
      next()
    })
  } catch (err) {
    next(err)
  }
}

export async function signRefreshToken(userId: string): Promise<string> {
  try {
    const payload = {}
    const options: jwt.SignOptions = {
      expiresIn: REFRESH_EXPIRES_IN,
      issuer: 'pickurpage.com',
      audience: userId,
    }

    const token = jwt.sign(payload, REFRESH_SECRET, options)

    // Store refresh token in Redis (1 year)
    await redisClient.set(userId, token, { EX: 7 * 24 * 60 * 60 })
    return token
  } catch (err) {
    console.error('Error signing refresh token:', (err as Error).message)
    throw createError.InternalServerError()
  }
}

export async function verifyRefreshToken(refreshToken: string): Promise<string> {
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload
    const userId = payload.aud as string

    const storedToken = await redisClient.get(userId)
    if (storedToken && storedToken === refreshToken) return userId

    throw createError.Unauthorized()
  } catch (err) {
    console.error('Error verifying refresh token:', (err as Error).message)
    throw createError.Unauthorized()
  }
}