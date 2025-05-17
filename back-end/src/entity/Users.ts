import { Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  BeforeInsert, 
  BeforeUpdate,
  OneToMany,
  ManyToMany,
  JoinTable
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { Application } from "./Application";
import { AcademicCredential } from "./AcademicCredential"; 
import { Skills } from "./Skills";

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  username: string

  @Column({unique: true})
  email: string

  @Column()
  password: string

  @Column({default : false})
  isBlocked : boolean

  @Column({
    type: "enum",
    enum: ["candidate", "lecturer", "admin"],
    default: "candidate"
  })
  userType: "candidate" | "lecturer" | "admin";

  @CreateDateColumn({type: "timestamp"})
  dateOfJoining: Date

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];

  @OneToMany(() => AcademicCredential, (credential) => credential.user)
  credentials: AcademicCredential[];

  @ManyToMany(() => Skills)
  @JoinTable()
  skills: Skills[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(){
    this.password = await bcrypt.hash(this.password,10);
  }


}
