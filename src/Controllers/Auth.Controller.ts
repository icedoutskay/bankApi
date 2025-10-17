import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUserDocument }  from '../models/User.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../helpers/jwt.helper';
import { storeRefreshToken, getRefreshToken, deleteRefreshToken } from '../helpers/redis.helper';
import { generateAccountNumber, formatUserResponse } from '../helpers/account.helper';


export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role = 'user' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const accountNumber = generateAccountNumber();

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role as 'user' | 'admin',
      accountNumber,
      balance: 0
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user: IUserDocument | null = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    await storeRefreshToken(user._id.toString(), refreshToken);

    res.json({
      message: 'Sign in successful',
      accessToken,
      refreshToken,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Server error during signin' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);

    const storedToken = await getRefreshToken(decoded.userId);
    if (!storedToken || storedToken !== refreshToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = generateAccessToken(decoded.userId, decoded.role);

    res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const signout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    await deleteRefreshToken(req.userId);

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Server error during signout' });
  }
};