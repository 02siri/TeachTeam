import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Tutor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("simple-array")
  role: string[];

  @Column("simple-array")
  courses: string[];

  @Column("simple-array")
  previousRoles: string[];

  @Column()
  availability: string;

  @Column("simple-array")
  skills: string[];

  @Column("simple-array")
  academicCred: string[];

  @Column("simple-array", { nullable: true })
  customSkills: string[];

  @Column()
  timestamp: string;
}
