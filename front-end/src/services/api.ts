import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001/api", 
  withCredentials: true,
});

export interface Tutor {
    email: string;
    applicationId: number;
    sessionType: "tutor" | "lab";
    courses: {courseID: number; courseCode: string; courseName: string; semester: string; description: string}[];
    previousRoles: string[];
    availability: string;
    timestamp: string;
    rank?: number | null;
    comments?: string | null;
    isSelected: boolean;
    selectedCourses : {courseID: number; courseCode: string; courseName: string; semester: string; description: string}[];
    status : "pending" | "approved" | "rejected";
    skills: {skillId: number; skillName: string}[];
    academicCredentials : {credentialId: number; qualification: string; institution : string; year: number}[];
    user?:{
      id: number;
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      isBlocked: boolean;
      dateOfJoining: string;
      skills: {skillId: number; skillName: string}[];
      credentials : {credentialId: number; qualification: string; institution : string; year: number}[];
    };
}

export const tutorApi = {
  submitApplication: async (applicationData: {
    email: string;
    sessionType: string[];
    courses: string[];
    previousRoles: string[];
    availability: string;
    timestamp: string;
    skills: string[];
    academicCred: { qualification: string; institution: string; year: number }[];
  }) => {
    const res = await api.post("/applications", applicationData);
    return res.data;
    }, 
    getAllApplications: async () => {
      const res = await api.get("/applications");
      return res.data;
    }, 
    getApplicationByEmail: async (email: string): Promise<Tutor[]> => {
      const res = await api.get(`/applications/${email}`);
      return res.data;
    },
  
    getCourses: async () => {
      const res = await api.get("/courses");
      return res.data;
    },

    submitSkills: async (email: string, selectedSkills: string[], customSkills: string[]) => {
      await api.post("/skills", {
        email,
        selectedSkills: selectedSkills.filter(s => s !== "Other"),
        customSkills: customSkills.filter(s => s.trim() !== "")
      });
    },
      
    submitCredentials: async (email: string, credentials: { qualification: string; institution: string; year: number }[]) => {
      return await api.post("/credentials", { email, credentials });
    },

    updateApplicationByLecturer : async(applicationId : number, updateData:{
      rank?: number | null;
      comments?: string | null;
      selectedCourseIDs?: number[];
      status?:"pending" | "approved" | "rejected";
      isSelected ?: boolean;
    }) => {
      const {selectedCourseIDs, ...rest} = updateData;
      const res = await api.post(`/applications/${applicationId}`, {
        ...rest,
        selectedCourseId : selectedCourseIDs,
      });
      return res.data;
    },
  
};

export interface User{
  id: number,
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  isBlocked: boolean,
  dateOfJoining: string,
  skills: {skillId: number; skillName: string}[],
  credentials : {credentialId: number; qualification: string; institution : string; year: number}[]
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
};
