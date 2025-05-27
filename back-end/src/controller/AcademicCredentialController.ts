import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { AcademicCredential } from "../entity/AcademicCredential";
import { Users } from "../entity/Users";

export const addAcademicCredentials = async (req: Request, res: Response) => {
  try {
    const { email, credentials} = req.body; 
    const userRepo = AppDataSource.getRepository(Users);
    const credentialRepo = AppDataSource.getRepository(AcademicCredential);
  
    const user = await userRepo.findOneBy({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
  
    const newCreds = credentials.map((cred: any) => {
      const ac = new AcademicCredential();
      ac.user = user;
      ac.qualification = cred.qualification;
      ac.institution = cred.institution;
      ac.year = cred.year;
      return ac;
    });

    await credentialRepo.save(newCreds);
    return res.status(201).json({ message: "Credentials saved" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
