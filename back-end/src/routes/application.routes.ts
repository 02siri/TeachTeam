import { Router } from "express";
import { ApplicationController } from "../controller/ApplicationController";
const router = Router();

router.post("/applications", ApplicationController.createApplication);
router.get("/applications", ApplicationController.getAllApplications);
router.get("/applications/:email", ApplicationController.getApplicationByEmail);
router.patch("/applications/:applicationID", ApplicationController.updateApplicationByLecturer);
export default router;
