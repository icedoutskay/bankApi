import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import config from '../config/config';
import ms from 'ms';


interface TokenPayload extends JwtPayload {
  userId: string;
  role: 'user' | 'admin';
}

export const generateAccessToken = (userId: string, role: 'user' | 'admin'): string => {
  const payload = { userId, role };
  const options: SignOptions = { expiresIn: config.ACCESS_TOKEN_EXPIRY as ms.StringValue };
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (userId: string, role: 'user' | 'admin'): string => {
  const payload = { userId, role };
  const options: SignOptions = { expiresIn: config.REFRESH_TOKEN_EXPIRY as ms.StringValue };
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
};