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
    submitApplication: async (applicationData: any) => {
      const res = await api.post("/tutors", applicationData);
      return res.data;
    }
};
  
  
  