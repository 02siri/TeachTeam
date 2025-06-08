import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Users } from "../entity/Users";
import { Like } from "typeorm";

export class UsersController {

private usersRepository = AppDataSource.getRepository(Users);

// Creates a new user in the database
  async createUser(request: Request, response: Response) {
    //dateOfJoining not in request body - automatically set by @CreateDateColumn declaration
    const { firstName, lastName, username, email, password, isBlocked } = request.body;


     const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@(student|staff)\.rmit\.edu\.au$/;
        return emailRegex.test(email);
    };
  
    // Password validation implementation checking for security requirements
    const validatePassword = (password : string) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 10;
        
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;
    }


    if (!firstName || !lastName || !email || !username || !password){
      return response.status(400).json({
        message: "All fields are required",
      })
    }

    if(!validateEmail(email)){
      return response.status(400).json({
        message: "Email must end in '@rmit.edu.au",
      })
    }

    if(!validatePassword(password)){
      return response.status(400).json({
        message: "Password must have atleast 10 characters, include uppercase, lowercase, number and special character.",
      })
    }

    if(firstName.toLowerCase() === "admin" || username.toLowerCase() === "admin"){
      return response.status(403).json({
        message: "Registration with 'admin' credentials is not allowed."
      });
    }

    try{
      const existingUser = await this.usersRepository.findOneBy({email});
      if(existingUser){
        return response.status(409).json({
          message: "Email already exists. Please use a different one."
        });
      }

    
    const user = Object.assign(new Users(), {
      firstName,
      lastName,
      email,
      username,
      password, //will be hashed by @BeforeInsert hook,
      isBlocked,
    });

      const savedUser = await this.usersRepository.save(user);
      return response.status(201).json(savedUser);
      
    }catch (error) {
      return response
        .status(400)
        .json({ message: "Failed to create user", error });
    }
  }

  //Retrieves all users from the database Users
async fetchAllUsers(request: Request, response: Response) {
    try{
    const users = await this.usersRepository.find();
    const protectedUsers = users.map(({password, ...rest}) => rest);
    return response.json(protectedUsers);
    }catch(error){
        return response
        .status(500)
        .json({message: "Error fetching users", error});
    }
  }


// Retrieves only candidates
async fetchCandidates(request: Request, response: Response){
   try{
    const candidates = await this.usersRepository.find({
    where:{
        email: Like("%@student.rmit.edu.au"),
    },
   });
   const protectedUsers = candidates.map(({password, ...rest}) => rest);
   return response.json(protectedUsers);
} catch(error){
    return response
    .status(500)
    .json({message: "Erorr fetching student users", error})
}
}

// Retrieves only lecturers
async fetchLecturers(request: Request, response: Response){
    try{
     const lecturers = await this.usersRepository.find({
     where:{
        email: Like("%@staff.rmit.edu.au"),
     },
    });
    const protectedUsers = lecturers.map(({password, ...rest}) => rest);
    return response.json(protectedUsers);
 }catch(error){
    return response
    .status(500)
    .json({message: "Erorr fetching staff users",error})
}
}

async fetchUserByEmail(request: Request, response: Response){
    const {email} = request.params;

    if(!email){
      return response.status(400).json({
        message: "Email is required",
      })
    }
    
    try{
          const relations = email.includes('@student.rmit.edu.au') 
      ? ["applications", "skills", "credentials"]
      : ["assignedCourses", "skills", "credentials"];

    const user = await this.usersRepository.findOne({
      where: {email: request.params.email},
      relations: relations,
    });;
      if(user){
        const {password, ...protectedUser} = user;
        return response.status(200).json(protectedUser);
      }else{
        return response.status(400).json({
          message: "User not found",
        })
      }
    }catch(error){
      return response.status(500).json({
        message: "Error fetching user by email : ", error,
      })
    }
  }
}
