import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Users } from "../entity/Users";
import * as bcrypt from "bcryptjs";


export class AuthController{
    private usersRepository = AppDataSource.getRepository(Users);
    async login(request: Request, response: Response){
        const {email, password} = request.body;

        console.log("Password request: ", password);

        if(!email || !password){
            return response.status(400).json({
                message: "Please fill all the fields"
            })
        }

        try{
            const user = await this.usersRepository.findOneBy({email});
            console.log("Stored Password: ", user ? user.password: "User not found");
            
            if(!user){
                return response.status(401).json({
                    message: "Invalid Credentials"
                })
            }

            if(user.isBlocked){
            console.log("User is blocked, returning 403");
            return response.status(403).json({ 
                message: "Account is blocked. Please contact support." 
            });
            }

            if(!user.isBlocked){
                console.log("The user is not blocked: ", user.isBlocked);
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log("Password valid: ", isPasswordValid);
            if(!isPasswordValid){
                return response.status(401).json({
                    message: "Invalid Credentials"
                })
            }
            return response.status(200).json({
                message: "Login Successful",
                user: {email: user.email, username: user.username},
            })
        }catch(error){
            console.log("Login Error");
            return response.status(500).json({
                message: "Login Failed"
            })
        }
    }

    async logout(request: Request, response: Response){
        request.session.destroy((err?: Error) => {
            if(err){
                console.log("Error destoying session" , err);
                return response.status(500).json({
                    message: "Logout failed"
                })
            }
            response.clearCookie('connect.sid'); //clear session cookie
            return response.status(200).json({
                message: "Logout succcessful"
            })
        });
    }
}
