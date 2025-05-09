import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001/api", 
});

export interface Tutor {
    id: number;
    role: string[];                   
    courses: string[];                
    previousRoles: string[];
    availability: string;           
    skills: string[];
    academicCred: string[];
    timestamp: string;
}

export const tutorApi = {
    submitApplication: async (applicationData: Omit<Tutor, "id">) => {
      const res = await api.post("/tutors", applicationData);
      return res.data;
    }
};

export interface User{
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  dateOfJoining: string
}

export const userApi = {
  createUser: async(userData: Omit<User,"id" | "dateOfJoining"> & {password: string}) => {
    const res = await api.post("/users", userData);
    return res.data;
  },
  getAllUsers: async(): Promise<User[]> => {
    const res = await api.get("/users");
    return res.data;
  },
  getStudentUsers: async(): Promise<User[]> => {
    const res = await api.get("/users/students");
    return res.data;
  },

  getStaffUsers: async(): Promise<User[]> => {
    const res = await api.get("/users/staff");
    return res.data;
  }
}
  
  
  