import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Users } from "./Users";

@Entity()
export class AcademicCredential {
  @PrimaryGeneratedColumn()
  credentialId: number;

  @ManyToOne(() => Users, (user) => user.credentials)
  user: Users;

  @Column()
  qualification: string;

  @Column()
  institution: string;

  @Column()
  year: number;
}
