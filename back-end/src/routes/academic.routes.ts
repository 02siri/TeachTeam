import { Router } from "express";
import { addAcademicCredentials } from "../controller/AcademicCredentialController";

const router = Router();
router.post("/credentials", addAcademicCredentials);
export default router;
