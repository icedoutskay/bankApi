import createError from "http-errors";
import type { Request, Response, NextFunction } from "express";
import { User } from "../Models/user.model";
import { authSchema } from "../helpers/validation_schema";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../helpers/jwt_helper";
import redisClient from "../helpers/init_redis";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authSchema.validateAsync(req.body);

    const doesExist = await User.findOne({ email: result.email });
    if (doesExist)
      throw createError.Conflict(`${result.email} is already registered`);

    const user = new User(result);
    const savedUser = await user.save();

    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);

    res.status(201).json({ accessToken, refreshToken });
  } catch (error: any) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });

    if (!user) throw createError.NotFound("User not registered");

    const isMatch = await user.isValidPassword(result.password);
    if (!isMatch)
      throw createError.Unauthorized("Invalid username or password");

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    if (error.isJoi === true)
      return next(createError.BadRequest("Invalid Username/Password"));
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest("Missing refresh token");

    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest("Missing refresh token");

    const userId = await verifyRefreshToken(refreshToken);
    const result = await redisClient.del(userId);

    if (result === 0)
      console.warn("No session found in Redis for user:", userId);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};