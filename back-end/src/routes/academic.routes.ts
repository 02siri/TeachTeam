import { Router } from "express";
import { addAcademicCredentials } from "../controller/academicCredentialController";

const router = Router();
router.post("/credentials", addAcademicCredentials);
export default router;
