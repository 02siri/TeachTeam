import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { Users } from "../entity/Users";
import { Course } from "../entity/Course";

export class ApplicationController {
  static async createApplication(req: Request, res: Response) {
    try {
      const { email, courseCode, sessionType, availability } = req.body;

      const userRepo = AppDataSource.getRepository(Users);
      const courseRepo = AppDataSource.getRepository(Course);
      const appRepo = AppDataSource.getRepository(Application);

      const user = await userRepo.findOneByOrFail({ email });
      const course = await courseRepo.findOneByOrFail({ courseCode });

      const application = appRepo.create({
        user,
        course,
        sessionType,
        availability,
        status: "pending",
        isSelected: false,
        timestamp: new Date(),
      });

      await appRepo.save(application);
      return res.status(201).json({ message: "Application submitted", application });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to submit application" });
    }
  }
}
