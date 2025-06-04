import "reflect-metadata";
import express from "express";
import dotenv from 'dotenv';
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import skillRoutes from "./routes/skills.routes";
import cors from "cors";
import { insertDefaultCourses } from "./services/insertDefaultCourses";
import academicRoutes from "./routes/academic.routes";
import applicationRoutes from "./routes/application.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
  // If it's an OPTIONS request, log headers too
  if (req.method === 'OPTIONS') {
    console.log('  OPTIONS Request Headers:', req.headers);
  }
  next();
});

// app.use(cors({
//   origin: ['http://localhost:3000','http://localhost:3002'],
//   credentials: true,
//   // methods : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
// }));

// app.options('*', (req, res) => {
//   res.sendStatus(200);
// });
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3002'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));

// Handle preflight requests explicitly
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3002'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", courseRoutes);
app.use("/api", skillRoutes);
app.use("/api", academicRoutes);
app.use("/api", applicationRoutes);


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
