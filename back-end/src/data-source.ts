import "reflect-metadata";
import { DataSource } from "typeorm";
import { Skills } from "./entity/Skills";
import { Course } from "./entity/Course";
import { Application } from "./entity/Application";
import { AcademicCredential } from "./entity/AcademicCredential";
import { Users } from "./entity/Users";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  username: "S3959795",
  password: "srishMySql11",
  database: "S3959795",
  // synchronize: true will automatically create database tables based on entity definitions
  // and update them when entity definitions change. This is useful during development
  // but should be disabled in production to prevent accidental data loss.
  synchronize: true,
  logging: true,
  entities: [Users, Course, AcademicCredential, Application, Skills],
  migrations: [],
  subscribers: [],
});
