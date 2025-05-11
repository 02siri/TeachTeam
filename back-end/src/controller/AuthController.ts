import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Users } from "../entity/Users";
import * as bcrypt from "bcryptjs";

export class AuthController{
    private usersRepository = AppDataSource.getRepository(Users);
    async login(request: Request, response: Response){
        const {email, password} = request.body;

        if(!email || !password){
            return response.status(400).json({
                message: "Please fill all the fields"
            })
        }

        try{
            const user = await this.usersRepository.findOneByOrFail({email});
            if(!user){
                return response.status(401).json({
                    message: "Invalid Credentials"
                })
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(!isPasswordValid){
                return response.status(401).json({
                    message: "Invalid Credentials"
                })
            }

            //Request session when authentication is successful
            request.session.userID = user.id;
            request.session.email = user.email;
            request.session.username = user.username;

            return response.status(500).json({
                message: "Login Successful",
                user: {id: user.id, email: user.email, username: user.username}
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

    async getCurrentUser(request: Request, response: Response){
        if(request.session.userID){
            try{
                const user = await this.usersRepository.findOneBy({
                    id: request.session.userID
                })
                if(user){
                    const {password,...userWithoutPswd} = user;
                    return response.status(200).json(userWithoutPswd);
                }else{
                    return response.status(404).json({
                        message: "User not found in session"
                    })
                }
            }catch(error){
                console.error("Error fetching current user: ", error);
                return response.status(500).json({
                    message: "Error fetching current user"
                })
            }
        }else{
            return response.status(401).json({
                message : "User not authenticated"
            })
        }
    }
}