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
  submitApplication: async (applicationData: {
    email: string;
    role: string[];
    courses: string[];
    previousRoles: string[];
    availability: string;
    timestamp: string;
  }) => {
    const res = await api.post("/apply", applicationData);
    return res.data;
  },  
    getApplication: async (email: string) => {
      const res = await api.get(`/apply?email=${email}`);
      return res.data;
    },    
    getCourses: async () => {
      const res = await api.get("/courses");
      return res.data;},

    submitSkills: async (email: string, skills: string[], customSkills: string[]) => {
      await api.post("/skills", {
        email,
        skills: [...skills.filter(s => s !== "Other"), ...customSkills.filter(s => s.trim() !== "")],
      });
    },
    submitCredentials: async (email: string, credentials: { qualification: string; institution: string; year: number }[]) => {
      return await api.post("/credentials", { email, credentials });
    },
    

};

export interface User{
  id: number,
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  isBlocked: boolean,
  dateOfJoining: string
}

export const userApi = {
  createUser: async(userData: Omit<User,"id" | "dateOfJoining" | "isBlocked"> & {password: string}) => {
    const res = await api.post("/users", userData);
    return res.data;
  },
  getAllUsers: async(): Promise<User[]> => {
    const res = await api.get("/users");
    return res.data;
  },
  getCandidates: async(): Promise<User[]> => {
    const res = await api.get("/users/candidates");
    return res.data;
  },

  getLecturers: async(): Promise<User[]> => {
    const res = await api.get("/users/lecturers");
    return res.data;
  },

  getUserByEmail: async (email: string) : Promise<User> => {
    const res = await api.get(`/users/email/${email}`);
    return res.data;

  }
}
  
export const authApi = {
  login: async(credentials: {email: string, password: string}) => {
    const res = await api.post<{message: string; user: {email: string, username: string}}>
    ("/login", credentials);
    return res.data
  },
  
  logout: async () => {
    const res = await api.post("/logout");
    return res.data;
  },
} 
  