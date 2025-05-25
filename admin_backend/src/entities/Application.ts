import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Users } from "./Users";
import { Course } from "./Course";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  applicationId: number;

  @ManyToOne(() => Users, (user) => user.applications)
  user: Users;

  @ManyToMany(() => Course)
  @JoinTable()
  courses: Course[];
  
  @Column()
  sessionType: "tutor" | "lab";

  @Column()
  availability: "Part-Time" | "Full-Time";

  @Column()
  status: "pending" | "approved" | "rejected";

  @ManyToMany(() => Course, (course)=>course.applicationsSelectedFor)
  @JoinTable({name: "application_selected_courses"})
  selectedCourses:
   Course[];

  @Column({nullable: true})
  rank: number;

  @Column("text", {nullable: true})
  comments: string;

  @Column()
  isSelected: boolean;

  @Column()
  timestamp: Date;

  @Column("simple-array")
  previousRoles: string[];
}
