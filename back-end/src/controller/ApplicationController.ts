import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { Users } from "../entity/Users";
import { Course } from "../entity/Course";

export class ApplicationController {
  static async createApplication(req: Request, res: Response) {
    try {
      console.log("Received application payload:", req.body); // log input

      const { email, role, courses, previousRoles, availability, timestamp } = req.body;

      const userRepo = AppDataSource.getRepository(Users);
      const courseRepo = AppDataSource.getRepository(Course);
      const appRepo = AppDataSource.getRepository(Application);

      const user = await userRepo.findOneByOrFail({ email });

      const applications = [];

      for (const courseCode of courses) {
        const course = await courseRepo.findOneBy({ courseCode });
        if (!course) {
          console.warn(`Course not found: ${courseCode}`);
          continue;
        }
        if (!Array.isArray(previousRoles)) {
            return res.status(400).json({ error: "Invalid previousRoles format. Must be an array." });
          }
          
        
        const application = appRepo.create({
          user,
          course,
          previousRoles,
          sessionType: role[0]?.toLowerCase() === "tutor" ? "tutor" : "lab", 
          availability,
          status: "pending",
          isSelected: false,
          timestamp: new Date(timestamp),
        });

        applications.push(application);
      }

      await appRepo.save(applications);
      return res.status(201).json({ message: "Application(s) submitted", count: applications.length });
    } catch (err: any) {
      console.error("❌ ApplicationController Error:", err.message, err.stack);
      return res.status(500).json({ error: "Internal server error", detail: err.message });
    }
  }
}
