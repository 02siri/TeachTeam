import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Users } from "./Users";
import { Course } from "./Course";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  applicationId: number;

  @ManyToOne(() => Users, (user) => user.applications)
  user: Users;

  @ManyToOne(() => Course, (course) => course.applications)
  course: Course;

  @Column()
  sessionType: "tutor" | "lab";

  @Column()
  availability: "Part-Time" | "Full-Time";

  @Column()
  status: "pending" | "approved" | "rejected";

  @Column()
  timestamp: Date;

  @Column()
  isSelected: boolean;

  @Column("simple-array")
  previousRoles: string[];
}
