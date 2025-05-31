import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { Users } from "../entity/Users";
import { Course } from "../entity/Course";
import { Any, In, Like } from "typeorm";
import { Skills } from "../entity/Skills";
import { AcademicCredential } from "../entity/AcademicCredential";
import { normalizeSkills } from "../services/skillService";
import session from "express-session";
import { Subject } from "typeorm/persistence/Subject";

export class ApplicationController {
  static async createApplication(req: Request, res: Response) {
  try {
    const {
      email,
      role,
      courses,
      previousRoles,
      availability,
      skills: applicationSkills,
      academicCred: applicationCredentials,
      timestamp,
    } = req.body;

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

    const savedApplication = await appRepo.save(application);

    const skillEntitiesForApplication: Skills[] = [];
    if (Array.isArray(applicationSkills)) {
      const normalizedSkillNames = normalizeSkills(applicationSkills);
      for (const skillName of normalizedSkillNames) {
        let skill = await skillRepo.findOne({ where: { skillName } });
        if (!skill) {
          skill = skillRepo.create({ skillName });
          await skillRepo.save(skill);
        }
        skillEntitiesForApplication.push(skill);
      }
    }
    savedApplication.skills = skillEntitiesForApplication;

    //so here i changed relation for academic credentials to ManyToMany
    const academicCredentialEntitiesForApplication: AcademicCredential[] = [];

    if (Array.isArray(applicationCredentials)) {
      for (const credData of applicationCredentials) {
        let credential = await credentialRepo.findOne({
          where: {
            qualification: credData.qualification,
            institution: credData.institution,
            year: credData.year,
          },
        });

        if (!credential) {
          credential = credentialRepo.create({
            qualification: credData.qualification,
            institution: credData.institution,
            year: credData.year,
            user: user, // optional: link to user if needed
          });
          await credentialRepo.save(credential);
        }

        academicCredentialEntitiesForApplication.push(credential);
      }
    }
    savedApplication.academicCredentials = academicCredentialEntitiesForApplication;

    await appRepo.save(savedApplication);

    return res.status(201).json({
      message: "Application submitted",
      applicationId: savedApplication.applicationId,
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
  
  static async getFilteredApplications(req: Request, res: Response) {
    try {
      const appRepo = AppDataSource.getRepository(Application);
      const { candidateName, sessionType, availability, skills } = req.query;

      const queryBuilder = appRepo.createQueryBuilder("application")
        .leftJoinAndSelect("application.user", "user")
        .leftJoinAndSelect("application.skills", "skills")
        .leftJoinAndSelect("application.academicCredentials", "academicCredentials")
        .leftJoinAndSelect("application.courses", "courses")
        .leftJoinAndSelect("application.selectedCourses", "selectedCourses")
        .orderBy("application.timestamp", "DESC");

      // Apply Candidate Name filter
      if (candidateName && typeof candidateName === 'string') {
        const names = candidateName.split(',').map(name => name.trim().toLowerCase());
        const nameConditions = names.map(name => 
          `(LOWER(user.firstName) LIKE :firstName_${name.replace(/[^a-zA-Z0-9]/g, '')} OR LOWER(user.lastName) LIKE :lastName_${name.replace(/[^a-zA-Z0-9]/g, '')})`
        );
        if (nameConditions.length > 0) {
          queryBuilder.andWhere(`(${nameConditions.join(' OR ')})`, names.reduce((acc: Record<string, string>, name) => {
            acc[`firstName_${name.replace(/[^a-zA-Z0-9]/g, '')}`] = `%${name}%`;
            acc[`lastName_${name.replace(/[^a-zA-Z0-9]/g, '')}`] = `%${name}%`;
            return acc;
          }, {}));
        }
      }

      // Apply Session Type filter
      if (sessionType && typeof sessionType === 'string') {
        const sessionTypes = sessionType.split(',').map(type => type.trim().toLowerCase());
        if (sessionTypes.length > 0) {
          queryBuilder.andWhere("application.sessionType IN (:...sessionTypes)", { sessionTypes });
        }
      }

      // Apply Availability filter
      if (availability && typeof availability === 'string') {
        const availabilities = availability.split(',').map(avail => avail.trim().toLowerCase());
        if (availabilities.length > 0) {
          queryBuilder.andWhere("application.availability IN (:...availabilities)", { availabilities });
        }
      }

      // Apply Skills filter
      if (skills && typeof skills === 'string') {
        const skillNames = skills.split(',').map(skill => skill.trim().toLowerCase());
        const skillConditions = skillNames.map(skill => `LOWER(skills.skillName) LIKE :skill_${skill.replace(/[^a-zA-Z0-9]/g, '')}`);
        if (skillConditions.length > 0) {
          queryBuilder.andWhere(`(${skillConditions.join(' OR ')})`, skillNames.reduce((acc: Record<string, string>, skill) => {
            acc[`skill_${skill.replace(/[^a-zA-Z0-9]/g, '')}`] = `%${skill}%`;
            return acc;
          }, {}));
        }
      }

      const applications = await queryBuilder.getMany();
      return res.status(200).json(applications);
    } catch (err: any) {
      console.error("Error fetching filtered applications:", err.message);
      return res.status(500).json({ error: "Failed to fetch filtered applications", detail: err.message });
    }
  }

  static async updateApplicationByLecturer(req:Request, res:Response){
    try{
      const {applicationId} = req.params;
      const {rank, comments, selectedCourseIds, status, isSelected} = req.body

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

      //Input validations
      if(rank!==undefined && (typeof rank !=="number" || rank < 0)){
        return res.status(400).json({
          error: "Rank must be a non-negative number"
        });
      }

      if(comments!==undefined && typeof rank !=="string" ){
        return res.status(400).json({
          error: "Comments must be a string"
        });
      }

      if(selectedCourseIds !==undefined){
        if(!Array.isArray(selectedCourseIds)){
          return res.status(400).json({
          error: "selectedCourseID must be an array of numbers."
        });
        }
      }

      //updating lecturer-specific fields
      if(rank!==undefined){
        application.rank = rank;
      }

      if(rank !==undefined && rank !=null){
        const applicationsWithSameRank = await appRepo.find({
          where : {rank : rank},
        })

        if(applicationsWithSameRank.length > 0 && applicationsWithSameRank.some(app=> app.applicationId !== application.applicationId)){
           return res.status(400).json({
          error: `Rank ${rank} is already assigned to another applicant. Please chooose a unique rank.`
        });
        }
      }

      if(comments!==undefined){
        application.comments =  comments;
       }

       if(status!==undefined){
        application.status = status;
       }

       //handle selected courses
       if(selectedCourseIds &&  Array.isArray(selectedCourseIds)){
        const coursesToSelect = await courseRepo.find({
          where: {courseID :In(selectedCourseIds)}
        })

        application.selectedCourses = coursesToSelect;
        application.isSelected = true;
       
       } else if(selectedCourseIds === null || selectedCourseIds === undefined){
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

