import { Router, Request, Response } from "express";
import { CourseController } from "../controller/courseController";

const router = Router();
const courseController = new CourseController();

router.get("/courses", (req: Request, res: Response) => courseController.getAllCourses(req, res));

export default router;
