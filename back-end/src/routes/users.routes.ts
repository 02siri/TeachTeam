import { Router, Request, Response } from "express";
import { UsersController } from "../controller/UsersController";
import { ResolutionMode } from "typescript";

const router = Router();
const usersController = new UsersController();

router.post("/users", (req: Request, res: Response) => usersController.createUser(req, res));
router.get("/users", (req: Request, res: Response) => usersController.fetchAllUsers(req, res));
router.get("/users/candidates", (req: Request, res: Response) => usersController.fetchCandidates(req, res));
router.get("/users/lecturers", (req: Request, res: Response) => usersController.fetchLecturers(req, res));
router.get("/users/email/:email", (req: Request, res: Response)=> usersController.fetchUserByEmail(req, res));

export default router;
