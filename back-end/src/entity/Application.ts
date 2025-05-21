import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Users } from "./Users";
import { Course } from "./Course";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  applicationId: number;

  @ManyToOne(() => Users, (user) => user.applications)
  user: Users;

  //Relation 1 : Courses Candidate APPLIED for
  @ManyToMany(() => Course)
  @JoinTable()
  courses: Course[];
  
  @Column()
  sessionType: "tutor" | "lab";

  @Column()
  availability: "Part-Time" | "Full-Time";

  @Column()
  status: "pending" | "approved" | "rejected";

  //Relation 2 : Courses Lecturer SELECTED the candidate for
  @ManyToMany(() => Course, (course)=>course.applicationsSelectedFor)
  @JoinTable({name: "application_selected_courses"})
  selectedCourses:
   Course[];

  //rank is optional
  @Column({nullable: true})
  rank: number;

  //comments are optional ; "text" for potentially longer comments
  @Column("text", {nullable: true})
  comments: string;

  @Column()
  isSelected: boolean;

  @Column()
  timestamp: Date;

  @Column("simple-array")
  previousRoles: string[];
}
