// src/entities/Course.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
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

  @OneToMany(() => Application, (app) => app.course)
  applications: Application[];
}
