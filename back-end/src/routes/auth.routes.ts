import {Router, Request, Response} from "express";
import { AuthController } from "../controller/AuthController";

const router = Router();
const authController = new AuthController();

router.post("/login", (req: Request, res: Response) => authController.login(req, res));
router.post("/logout", (req: Request, res: Response) => authController.logout(req, res));
router.get("/current-user", authController.getCurrentUser);

export default router;