import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { Users } from "../entity/Users";
import { Course } from "../entity/Course";
import { In } from "typeorm";
import { Skills } from "../entity/Skills";
import { AcademicCredential } from "../entity/AcademicCredential";
import { normalizeSkills } from "../services/skillService";

export class ApplicationController {
  static async createApplication(req: Request, res: Response) {
    try {
      console.log("Received application payload:", req.body);

      const { email, role, courses, previousRoles, availability, skills: applicationSkills, academicCred: applicationCredentials, timestamp } = req.body;

      const userRepo = AppDataSource.getRepository(Users);
      const courseRepo = AppDataSource.getRepository(Course);
      const appRepo = AppDataSource.getRepository(Application);
      const skillRepo = AppDataSource.getRepository(Skills);
      const credentialRepo = AppDataSource.getRepository(AcademicCredential);

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
      // --- Process Skills for the Application ---
      const skillEntitiesForApplication: Skills[] = [];
      if (applicationSkills && Array.isArray(applicationSkills) && applicationSkills.length > 0) {
        const normalizedSkillNames = normalizeSkills(applicationSkills);

        // Find existing skills or create new ones if they don't exist
        for (const skillName of normalizedSkillNames) {
          let skill = await skillRepo.findOne({ where: { skillName } });
          if (!skill) {
            // If skill doesn't exist, create it (this is where `addSkillsToCandidate` would typically do it)
            skill = skillRepo.create({ skillName });
            await skillRepo.save(skill);
          }
          skillEntitiesForApplication.push(skill);
        }
      }
      application.skills = skillEntitiesForApplication; // Link to the application

      // --- Process Academic Credentials for the Application ---
      const academicCredentialEntitiesForApplication: AcademicCredential[] = [];
      if (applicationCredentials && Array.isArray(applicationCredentials) && applicationCredentials.length > 0) {
        for (const credData of applicationCredentials) {
          // We need to either find an existing one or create a new one.
          // For AcademicCredential, it's OneToMany to Application, so we'll create new instances
          // and link them to this specific application.
          let newCredential = credentialRepo.create({
            qualification: credData.qualification,
            institution: credData.institution,
            year: credData.year,
            user: user, // Link to the user as well, if needed for user's profile
           });
          newCredential = await credentialRepo.save(newCredential);
          academicCredentialEntitiesForApplication.push(newCredential);
        }
      }
      application.academicCredentials = academicCredentialEntitiesForApplication;

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
        relations: ["user","skills","academicCredentials","courses","selectedCourses"], 
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
          "skills",
          "academicCredentials",
          "courses",
          "selectedCourses"
        ],
        order:{
          timestamp: "desc"
        }
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

