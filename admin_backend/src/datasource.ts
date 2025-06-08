import "reflect-metadata";
import { DataSource } from "typeorm";
import { Users } from "./entities/Users";
import { AcademicCredential } from "./entities/AcademicCredential";
import { Application } from "./entities/Application";
import { Skills } from "./entities/Skills";
import { Course } from "./entities/Course";


export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  username: "", 
  password: "", 
  database: "",
  synchronize: true,
  logging: true,
  entities: [Users, Course, AcademicCredential, Application, Skills],
});
