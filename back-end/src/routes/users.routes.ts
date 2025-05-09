import { Router, Request, Response } from "express";
import { UsersController } from "../controller/UsersController";

const router = Router();
const usersController = new UsersController();

router.post("/users", (req: Request, res: Response) => usersController.createUser(req, res));
router.get("/users", (req: Request, res: Response) => usersController.fetchAllUsers(req, res));
router.get("/users/students", (req: Request, res: Response) => usersController.fetchStudentUsers(req, res));
router.get("/users/staff", (req: Request, res: Response) => usersController.fetchStaffUsers(req, res));

export default router;
