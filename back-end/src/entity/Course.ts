import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Application } from "./Application";

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  courseID: number;

  @Column()
  courseCode: string;

  @Column()
  courseName: string;

  @Column()
  semester: string;

  @Column("text")
  description: string;

  @ManyToMany(() => Application, (app) => app.courses)
  applications: Application[];
}