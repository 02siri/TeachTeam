import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Application } from "./Application";
import { application } from "express";

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

  //Relation 1: courses candidates have APPLIED for
  @ManyToMany(() => Application, (app) => app.courses)
  applications: Application[];

  //Relation 2: courses lecturers have SELECTED for the candidate
  @ManyToMany(()=> Application, (application)=>application.selectedCourses)
  applicationsSelectedFor: Application[];


}