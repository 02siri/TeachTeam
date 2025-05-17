import express from "express";
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse
} from "../controller/courseController";

const router = express.Router();

router.get("/courses", getAllCourses);
router.post("/courses", createCourse);
router.put("/courses:id", updateCourse);
router.delete("/courses:id", deleteCourse);

export default router;
