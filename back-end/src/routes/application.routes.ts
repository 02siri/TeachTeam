import { Router } from "express";
import { ApplicationController } from "../controller/ApplicationController";
const router = Router();

router.post("/applications", ApplicationController.createApplication);
router.get("/applications", ApplicationController.getAllApplications);
router.get("/applications/filtered", ApplicationController.getFilteredApplications);
router.get("/applications/:email", ApplicationController.getApplicationByEmail);
router.post("/applications/:applicationId", ApplicationController.updateApplicationByLecturer);
export default router;
