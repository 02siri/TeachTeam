import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Users } from "../entity/Users";
import { Like } from "typeorm";

export class UsersController {

private usersRepository = AppDataSource.getRepository(Users);

// Creates a new user in the database
  async createUser(request: Request, response: Response) {
    //dateOfJoining not in request body - automatically set by @CreateDateColumn declaration
    const { firstName, lastName, email, password } = request.body;

    const user = Object.assign(new Users(), {
      firstName,
      lastName,
      email,
      password, //will be hashed by @BeforeInsert hook
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      return response.status(201).json(savedUser);
    } catch (error) {
      return response
        .status(400)
        .json({ message: "Error creating user", error });
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


// Retrieves only students
async fetchStudentUsers(request: Request, response: Response){
   try{
    const studentUsers = await this.usersRepository.find({
    where:{
        email: Like('%@student.rmit.edu.au'),
    },
   });
   const protectedUsers = studentUsers.map(({password, ...rest}) => rest);
   return response.json(protectedUsers);
} catch(error){
    return response
    .status(500)
    .json({message: "Erorr fetching student users", error})
}
}

// Retrieves only staff
async fetchStaffUsers(request: Request, response: Response){
    try{
     const staffUsers = await this.usersRepository.find({
     where:{
         email: Like('%@staff.rmit.edu.au'),
     },
    });
    const protectedUsers = staffUsers.map(({password, ...rest}) => rest);
    return response.json(protectedUsers);
 }catch(error){
    return response
    .status(500)
    .json({message: "Erorr fetching staff users",error})
}
}
}
//   async one(request: Request, response: Response) {
//     const id = parseInt(request.params.id);
//     const user = await this.usersRepository.findOne({
//       where: { id },
//     });

//     if (!user) {
//       return response.status(404).json({ message: "User not found" });
//     }
//     return response.json(user);
//   }

//   /**
//    * Deletes a user from the database by their ID
//    * @param request - Express request object containing the user ID in params
//    * @param response - Express response object
//    * @returns JSON response with success message or 404 error if user not found
//    */
//   async remove(request: Request, response: Response) {
//     const id = parseInt(request.params.id);
//     const userToRemove = await this.usersRepository.findOne({
//       where: { id },
//     });

//     if (!userToRemove) {
//       return response.status(404).json({ message: "User not found" });
//     }

//     await this.usersRepository.remove(userToRemove);
//     return response.json({ message: "User removed successfully" });
//   }

//   /**
//    * Updates an existing user's information
//    * @param request - Express request object containing user ID in params and updated details in body
//    * @param response - Express response object
//    * @returns JSON response containing the updated user or error message
//    */
//   async update(request: Request, response: Response) {
//     const id = parseInt(request.params.id);
//     const { firstName, lastName, email, age } = request.body;

//     let userToUpdate = await this.usersRepository.findOne({
//       where: { id },
//     });

//     if (!userToUpdate) {
//       return response.status(404).json({ message: "User not found" });
//     }

//     userToUpdate = Object.assign(userToUpdate, {
//       firstName,
//       lastName,
//       email,
//       age,
//     });

//     try {
//       const updatedUser = await this.usersRepository.save(userToUpdate);
//       return response.json(updatedUser);
//     } catch (error) {
//       return response
//         .status(400)
//         .json({ message: "Error updating user", error });
//     }
//   }
// }
