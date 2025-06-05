import { In, Like } from "typeorm";
import { AppDataSource } from "./datasource";
import { Course } from "./entities/Course";
import { Users } from "./entities/Users";
import * as bcrypt from "bcryptjs";

export const resolvers = {
  Query: {
    candidatesChosenPerCourse: async () => {
      const courseRepo = AppDataSource.getRepository(Course);
      const allCourses = await courseRepo.find({
        relations: ["applicationsSelectedFor", "applicationsSelectedFor.user"],
      });

      return allCourses.map(course => ({
        courseName: course.courseName,
        selectedCandidates: (course.applicationsSelectedFor ?? []).map(app => app.user),
      }));
    },

    candidatesChosenForMoreThanThree: async () => {
      const userRepo = AppDataSource.getRepository(Users);
      const users = await userRepo.find({
        relations: ["applications", "applications.selectedCourses"],
      });

      return users.filter(user =>
        user.applications?.some(app => app.selectedCourses?.length > 3)
      );
    },

    candidatesNotChosen: async () => {
      const userRepo = AppDataSource.getRepository(Users);
      const users = await userRepo.find({
        relations: ["applications", "applications.selectedCourses"],
      });

      return users.filter(user =>
        user.applications?.every(app => (app.selectedCourses?.length ?? 0) === 0)
      );
    },
    
    getCourses: async () => {
      const courseRepo = AppDataSource.getRepository(Course);
      return await courseRepo.find({
        relations: ['lecturers']
      });
    },

    getLecturers: async ()=>{
      const userRepo = AppDataSource.getRepository(Users);
      return await userRepo.find({
        where: {email: Like ('%@staff.rmit.edu.au')},
        relations: ['assignedCourses'],
      });
    },

    getAllUsers : async ()=>{
      const userRepo = AppDataSource.getRepository(Users);
      return await userRepo.find();
    },
  },

  Mutation: {
    addCourse: async (_: unknown, { input }: { input: Partial<Course> }) => {
      const courseRepo = AppDataSource.getRepository(Course);
      const existing = await courseRepo.findOneBy({ courseCode: input.courseCode });
      if (existing) {
        throw new Error("Course code already exists. Please choose a different code.");
      }
      const newCourse = courseRepo.create(input);
      return await courseRepo.save(newCourse);
    },

    editCourse: async (
      _: unknown,
      { courseID, input }: { courseID: number | string; input: Partial<Course> }
    ) => {
      const courseRepo = AppDataSource.getRepository(Course);
      const course = await courseRepo.findOneBy({ courseID: Number(courseID) });
      if (!course) throw new Error("Course not found");
      Object.assign(course, input);
      return await courseRepo.save(course);
    },

    deleteCourse: async (_: unknown, { courseID }: { courseID: number | string }) => {
      const courseRepo = AppDataSource.getRepository(Course);
      const result = await courseRepo.delete({ courseID: Number(courseID) });
      return (result.affected ?? 0) > 0;
    },

    login: async(_:unknown, {username, password} : {username: string, password: string})=>{
      const userRepo = AppDataSource.getRepository(Users);
      let user = await userRepo.findOneBy({username});

      if(!user && username === "admin"){
        const newAdmin = userRepo.create({
          email: "admin",
          firstName:"Admin",
          lastName: "Admin",
          username: "admin",
          password: password,
          isBlocked: false
        });
        await userRepo.save(newAdmin);
        return true;
      }
      if(!user) return false;

      const isPasswordValid = await bcrypt.compare(password, user.password);
      return isPasswordValid;
    },

    assignLectToCourses: async(_:unknown, {userId, courseIds} : {userId: number; courseIds: number[]}) => {
      const userRepo = AppDataSource.getRepository(Users);
      const courseRepo = AppDataSource.getRepository(Course);

      const lecturer = await userRepo.findOne({
        where: {id: userId},
        relations: ['assignedCourses']
      });

      if(!lecturer)
        throw new Error('Lecturer Not Found');

      const courses = await courseRepo.findBy({courseID : In(courseIds)});
      if(courses.length<1)
        throw new Error ('A Lecturer must be assigned to at least one course');

      lecturer.assignedCourses =  courses;

      await userRepo.save(lecturer);
      return true;
    },

    blockUsers: async(_:unknown, {userId, isBlocked}: {userId: number, isBlocked: boolean})=>{
      const userRepo = AppDataSource.getRepository(Users);
      const user = await userRepo.findOneBy({id: userId});

      if(!user)
        throw new Error("User not found");

      user.isBlocked = isBlocked;
      await userRepo.save(user);
      return true;
    },

  },
};
