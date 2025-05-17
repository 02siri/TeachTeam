import "reflect-metadata";
import express from "express";
import dotenv from 'dotenv';
import { AppDataSource } from "./data-source";
import tutorRoutes from "./routes/tutor.routes";
import userRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import cors from "cors";
import { insertDefaultCourses } from "./services/insertDefaultCourses";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use("/api", tutorRoutes);
app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", courseRoutes);


AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");
    
    await insertDefaultCourses();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: unknown) =>
    console.log("Error during Data Source initialization:", error)
  );
