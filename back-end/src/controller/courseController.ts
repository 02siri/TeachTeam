import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";

export class CourseController {
  private courseRepo = AppDataSource.getRepository(Course);



  async getAllCourses(req: Request, res: Response) {
    try {
      const courses = await this.courseRepo.find();
      return res.json(courses);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json({ message: "Failed to fetch courses", error: err.message });
      }
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  }

}