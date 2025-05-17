import { Router } from "express";
import { ApplicationController } from "../controller/ApplicationController";
const router = Router();

router.post("/applications", ApplicationController.createApplication);

export default router;
