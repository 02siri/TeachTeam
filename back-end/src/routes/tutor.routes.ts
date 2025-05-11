import { Router, Request, Response } from "express";
import { TutorController } from "../controller/TutorController";

const router = Router();
const tutorController = new TutorController();

router.get("/tutors", (req: Request, res: Response) => tutorController.all(req, res));
router.get("/tutors", (req: Request, res: Response) => tutorController.getByEmail(req, res));
router.post("/tutors", (req: Request, res: Response) => tutorController.create(req, res));

export default router;
