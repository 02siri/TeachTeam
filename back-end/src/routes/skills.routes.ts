import { Router } from "express";
import { addSkillsToCandidate } from "../controller/skillsController";

const router = Router();

router.post("/skills", addSkillsToCandidate);

export default router;
