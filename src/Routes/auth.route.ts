import { Router } from "express";
import { register, login, refreshToken, logout} from "../Controllers/Auth.Controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.delete("/logout", logout);

export default router;