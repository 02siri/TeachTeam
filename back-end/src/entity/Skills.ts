import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Users } from "./Users"

@Entity()
export class Skills {
  @PrimaryGeneratedColumn()
  skillId: number;

  @Column()
  skillName: string;

  @ManyToMany(() => Users, (user) => user.skills)
  users: Users[]
}
