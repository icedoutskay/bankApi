import express  from "express";
import type { Request, Response, NextFunction } from "express";
import { createTransfer } from "../Controllers/transfer.controller"
import { authenticate, authorize } from "../helpers/authHelper";


const router = express.Router();

// POST /api/transfer
router.post(
  "/transfer",
  authenticate,
  authorize("user", "admin"),
  (req: Request, res: Response, next: NextFunction) => {
    createTransfer(req, res, next).catch(next);
  }
);

export default router;