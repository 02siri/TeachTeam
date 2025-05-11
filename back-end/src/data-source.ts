import "reflect-metadata";
import { DataSource } from "typeorm";
import { Tutor } from "./entity/Tutor";
import { Users } from "./entity/Users";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  username: "S3988110",
  password: "Dream@123",
  database: "S3988110",
  // synchronize: true will automatically create database tables based on entity definitions
  // and update them when entity definitions change. This is useful during development
  // but should be disabled in production to prevent accidental data loss.
  synchronize: true,
  logging: true,
  entities: [Tutor, Users],
  migrations: [],
  subscribers: [],
});
