import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Skills } from "../entity/Skills";
import { Users } from "../entity/Users";
import { getUserTypeFromEmail } from "../services/userType"; 
import { normalizeSkills } from "../services/skillService";

const skillRepo = AppDataSource.getRepository(Skills);
const userRepo = AppDataSource.getRepository(Users);

export const addSkillsToCandidate = async (req: Request, res: Response) => {
  const { email, selectedSkills, customSkills } = req.body;

  try {
    const user = await userRepo.findOne({
      where: { email },
      relations: ["skills"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const userType = getUserTypeFromEmail(email);
    if (userType !== "candidate") {
      return res.status(403).json({ message: "Only candidates can have skills" });
    }

    const allSkillNames = normalizeSkills([...selectedSkills, ...customSkills]);

    const skillEntities: Skills[] = [];

    for (const skillName of allSkillNames) {
      let skill = await skillRepo.findOne({ where: { skillName } });

      if (!skill) {
        skill = skillRepo.create({ skillName });
        await skillRepo.save(skill);
      }

      skillEntities.push(skill);
    }

    user.skills = skillEntities;
    await userRepo.save(user);

    res.status(200).json({ message: "Skills saved successfully", skills: skillEntities });
  } catch (error) {
    console.error("Error saving skills:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
