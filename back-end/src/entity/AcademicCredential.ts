import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from "typeorm";
import { Users } from "./Users";
import { Application } from "./Application";

@Entity()
export class AcademicCredential {
  @PrimaryGeneratedColumn()
  credentialId: number;

  @ManyToOne(() => Users, (user) => user.credentials)
  user: Users;

    @ManyToOne(()=> Application, (application) => application.academicCredentials)
  application: Application;

  @Column()
  qualification: string;

  @Column()
  institution: string;

  @Column()
  year: number;
}
