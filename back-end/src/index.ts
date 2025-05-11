import "reflect-metadata";
import express from "express";
import dotenv from 'dotenv';
import { AppDataSource } from "./data-source";
import tutorRoutes from "./routes/tutor.routes";
import userRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
import session from "express-session";
import "./types/express-session";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
secret: process.env.SESSION_SECRET!,
resave: false,
saveUninitialized: false,
cookie:{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 1000 * 60 * 60 * 24 * 7 //7 days
},
}));

app.use("/api", tutorRoutes);
app.use("/api", userRoutes);
app.use("/api", authRoutes);


AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: unknown) =>
    console.log("Error during Data Source initialization:", error)
  );
