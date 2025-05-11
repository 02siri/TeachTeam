import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001/api", 
  withCredentials: true,
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
      const res = await api.post("/apply", applicationData);
      return res.data;
    },
    getApplication: async (email: string) => {
      const res = await api.get(`/apply?email=${email}`);
      return res.data;
    },    
};

export interface User{
  id: number,
  firstName: string,
  lastName: string,
  username: string,
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
  
export const authApi = {
  login: async(credentials: {email: string, password: string}) => {
    const res = await api.post("/auth/login", credentials);
    return res.data
  },
  
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  getCurrentUser: async(): Promise<User|null> => {
    try{
      const res = await api.get("/auth/current-user");
      return res.data;
    }catch{
      return null;
    }
  }
} 
  