import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { Users } from "../entity/Users";
import { Course } from "../entity/Course";
import { In } from "typeorm";

export class ApplicationController {
  static async createApplication(req: Request, res: Response) {
    try {
      console.log("Received application payload:", req.body);

      const { email, role, courses, previousRoles, availability, timestamp } = req.body;

      const userRepo = AppDataSource.getRepository(Users);
      const courseRepo = AppDataSource.getRepository(Course);
      const appRepo = AppDataSource.getRepository(Application);

      if (!Array.isArray(previousRoles)) {
        return res.status(400).json({ error: "Invalid previousRoles format. Must be an array." });
      }

      const user = await userRepo.findOneByOrFail({ email });

      const courseList = await courseRepo.find({
        where: { courseCode: In(courses) },
      });

      if (courseList.length === 0) {
        return res.status(404).json({ error: "No matching courses found" });
      }

      const application = appRepo.create({
        user,
        courses: courseList,
        previousRoles,
        sessionType: role[0]?.toLowerCase() === "tutor" ? "tutor" : "lab",
        availability,
        status: "pending",
        isSelected: false,
        timestamp: new Date(timestamp),
      });

      await appRepo.save(application);

      return res.status(201).json({
        message: "Application submitted",
        applicationId: application.applicationId,
        courseCount: courseList.length,
      });
    } catch (err: any) {
      console.error("ApplicationController Error:", err.message, err.stack);
      return res.status(500).json({ error: "Internal server error", detail: err.message });
    }
  }
}

