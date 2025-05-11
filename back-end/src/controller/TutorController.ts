import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Tutor } from "../entity/Tutor";

export class TutorController {
  private tutorRepository = AppDataSource.getRepository(Tutor);


   //create a new tutor application
   async create(request: Request, response: Response) {
    const { email, role } = request.body;
  
    try {
      const existing = await this.tutorRepository.findBy({ email });
      const alreadyAppliedForRole = existing.find((entry) => entry.role === role);
      if (alreadyAppliedForRole) {
        return response.status(409).json({ message: `Already applied for ${role} role` });
      }
  
      if (existing.length >= 2) {
        return response.status(403).json({ message: "Already applied for both roles" });
      }
  
      const tutor = this.tutorRepository.create(request.body);
      const savedTutor = await this.tutorRepository.save(tutor);
      return response.status(201).json(savedTutor);
    } catch (error) {
      console.error("Error saving tutor:", error);
      return response.status(500).json({ message: "Failed to save tutor", error });
    }
  }
  
  


   //get all tutors
  async all(request: Request, response: Response) {
    try {
      const tutors = await this.tutorRepository.find();
      return response.json(tutors);
    } catch (error) {
      return response
        .status(500)
        .json({ message: "Failed to fetch tutors", error });
    }
  }



  async getByEmail(request: Request, response: Response) {
    const email = request.query.email as string;
    if (!email) {
      return response.status(400).json({ message: "Email query param is required" });
    } 
    try {
      const tutor = await this.tutorRepository.findOneBy({ email });
      if (tutor) {
        return response.json(tutor);
      } else {
        return response.status(404).json({ message: "No application found for this email" });
      }
    } catch (error) {
      console.error("Error fetching tutor:", error);
      return response.status(500).json({ message: "Failed to fetch tutor", error });
    }
  }
  


}
