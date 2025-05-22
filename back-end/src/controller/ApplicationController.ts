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

  static async getAllApplications(req: Request, res: Response) {
    try {
      const appRepo = AppDataSource.getRepository(Application);
  
      const applications = await appRepo.find({
        relations: ["user","user.skills","user.credentials","courses","selectedCourses"], 
        order: { timestamp: "DESC" },   
      });
  
      return res.status(200).json(applications);
    } catch (err: any) {
      console.error("Error fetching applications:", err.message);
      return res.status(500).json({ error: "Failed to fetch applications", detail: err.message });
    }
  }

  static async getApplicationByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const appRepo = AppDataSource.getRepository(Application);
      const applications = await appRepo.find({
        where: { user: { email } },
        relations: [
          "user", 
          "user.skills",
          "user.credentials",
          "courses",
          "selectedCourses"
        ],
      });

  
      if (!applications || applications.length === 0)
        return res.status(404).json({ error: "No applications found" });
      return res.status(200).json(applications);
    } catch (err: any) {
      return res.status(500).json({ error: "Error fetching application", detail: err.message });
    }
  }
  
  static async updateApplicationByLecturer(req:Request, res:Response){
    try{
      const {applicationId} = req.params;
      const {rank, comments, selectedCourseId, status, isSelected} = req.body

      const appRepo = AppDataSource.getRepository(Application);
      const courseRepo = AppDataSource.getRepository(Course);

      const application = await appRepo.findOne({
        where: {applicationId: parseInt(applicationId)},
        relations: ["courses","selectedCourses"]
      });

      if(!application){
        return res.status(400).json({
          error:"Application not found"
        })
      }

      //updating lecturer-specific fields
      if(rank!==undefined){
        application.rank = rank;
      }

      if(comments!==undefined){
        application.comments =  comments;
       }

       if(status!==undefined){
        application.status = status;
       }

       //handle selected courses
       if(selectedCourseId &&  Array.isArray(selectedCourseId)){
        const coursesToSelect = await courseRepo.find({
          where: {courseID :In(selectedCourseId)}
        })

        application.selectedCourses = coursesToSelect;
        application.isSelected = true;
       } else if(selectedCourseId === null || selectedCourseId === undefined){
        application.selectedCourses = [];
        application.isSelected = false;
       }

       await appRepo.save(application);

       return res.status(200).json({
        message: "Application updated successfully",
        application: application,
       });
    }
  catch(error){
    return res.status(500).json({
        message: "Error fetching user by email : ", error
      })
  }
}
}

