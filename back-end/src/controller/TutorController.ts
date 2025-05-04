import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Tutor } from "../entity/Tutor";

export class TutorController {
  private tutorRepository = AppDataSource.getRepository(Tutor);


   //create a new tutor application
  async create(request: Request, response: Response) {
    try {
      const tutor = this.tutorRepository.create(request.body);
      const savedTutor = await this.tutorRepository.save(tutor);
      return response.status(201).json(savedTutor);
    } catch (error) {
      console.error("Error saving tutor:", error);
      return response
        .status(500)
        .json({ message: "Failed to save tutor", error });
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


}
