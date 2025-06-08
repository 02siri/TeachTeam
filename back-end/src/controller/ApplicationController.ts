import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { Users } from "../entity/Users";
import { Course } from "../entity/Course";
import {In} from "typeorm";
import { Skills } from "../entity/Skills";
import { AcademicCredential } from "../entity/AcademicCredential";
import { normalizeSkills } from "../services/skillService";

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
      const { candidateName, sessionType, availability, skills, generalSearch} = req.query;

      const queryBuilder = appRepo.createQueryBuilder("application")
        .leftJoinAndSelect("application.user", "user")
        .leftJoinAndSelect("application.skills", "skills")
        .leftJoinAndSelect("application.academicCredentials", "academicCredentials")
        .leftJoinAndSelect("application.courses", "courses")
        .leftJoinAndSelect("application.selectedCourses", "selectedCourses")
        .orderBy("application.timestamp", "DESC");

      //Apply general search - searches accross candidate name, avaialability, skills and courses
      if (generalSearch && typeof generalSearch === 'string') {
      const searchTerm = generalSearch.trim().toLowerCase();
      if(!/^[A-Za-z0-9\s]*$/.test(searchTerm)){
        return res.status(400).json({error: "General Search term contains invalid characters."})
      }
      queryBuilder.andWhere(`(
        LOWER(user.firstName) LIKE :generalSearch OR 
        LOWER(user.lastName) LIKE :generalSearch OR 
        LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :generalSearch OR
        LOWER(application.availability) LIKE :generalSearch OR
        LOWER(skills.skillName) LIKE :generalSearch OR
        LOWER(courses.courseCode) LIKE :generalSearch OR
        LOWER(courses.courseName) LIKE :generalSearch OR
        LOWER(CONCAT(courses.courseCode, ' ', courses.courseName)) LIKE :generalSearch
      )`, { generalSearch: `%${searchTerm}%` });
    }
      // Apply Candidate Name checkbox filter
      if (candidateName && typeof candidateName === 'string') {
        const names = candidateName.split(',').map(name => name.trim().toLowerCase());
       const nameConditions = names.map((name, index) =>
        `(LOWER(user.firstName) LIKE :firstName_${index} OR LOWER(user.lastName) LIKE :lastName_${index} OR LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :fullName_${index})`
      );

       if (nameConditions.length > 0) {
        const nameParams: Record<string, string> = {};
        names.forEach((name, index) => {
          nameParams[`firstName_${index}`] = `%${name}%`;
          nameParams[`lastName_${index}`] = `%${name}%`;
          nameParams[`fullName_${index}`] = `%${name}%`;
        });
        
        queryBuilder.andWhere(`(${nameConditions.join(' OR ')})`, nameParams);

        }
      }

      // Apply Session Type checkbox filter
      if (sessionType && typeof sessionType === 'string') {
        const sessionTypes = sessionType.split(',').map(type => type.trim().toLowerCase());
        if (sessionTypes.length > 0) {
          queryBuilder.andWhere("LOWER(application.sessionType) IN (:...sessionTypes)", { sessionTypes });
        }
      }

      // Apply Availability checkbox filter
      if (availability && typeof availability === 'string') {
        const availabilities = availability.split(',').map(avail => avail.trim().toLowerCase());
        if (availabilities.length > 0) {
          queryBuilder.andWhere("LOWER(application.availability) IN (:...availabilities)", { availabilities });
        }
      }

      // Apply Skills checkbox filter
    if (skills && typeof skills === 'string') {
        const skillNames = skills.split(',').map(name => name.trim().toLowerCase());
        if (skillNames.length > 0) {
            queryBuilder.andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select("joinedSkill.skillId") // Select a column from the joined skills table
                    .from(Application, "app_alias") // Alias the outer application table to correlate
                    .innerJoin("app_alias.skills", "joinedSkill") // Join through the relation on the alias
                    .where("app_alias.applicationId = application.applicationId") // Correlate with the main query's application
                    .andWhere("LOWER(joinedSkill.skillName) IN (:...skillNames)", { skillNames: skillNames });
                return "EXISTS " + subQuery.getQuery();
            }, { skillNames: skillNames }); // Parameters for the subquery
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
      if(rank!==undefined && rank!==null && (typeof rank !=="number" || rank < 0)){
        return res.status(400).json({
          error: "Rank must be a non-negative number"
        });
      }

      if(comments!==undefined && comments!==null && typeof comments !=="string" ){
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
      if(isSelected !== undefined){
        application.isSelected = isSelected;

        if(isSelected){
          if(!selectedCourseIds || selectedCourseIds.length === 0){
            return res.status(400).json({
              error: "At least one course must be selected"
            });
          }
        }
        
      }

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
        
       
       } else if(selectedCourseIds === null || selectedCourseIds === undefined){
        application.selectedCourses = [];
        
       }

       await appRepo.save(application);

       return res.status(200).json({
        message: "Application updated successfully",
        application: application,
       });
    }
  catch(error){
    return res.status(500).json({
        message: "Error updating applications: ", error
      })
  }
}
}

