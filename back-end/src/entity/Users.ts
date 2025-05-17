import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert } from "typeorm";
import * as bcrypt from "bcryptjs";

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

  @CreateDateColumn({type: "timestamp"})
  dateOfJoining: Date

  @BeforeInsert()
  async hashPassword(){
    this.password = await bcrypt.hash(this.password,10);
  }
}
