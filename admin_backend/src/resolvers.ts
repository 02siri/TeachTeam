import { In, Like } from "typeorm";
import { AppDataSource } from "./datasource";
import { Course } from "./entities/Course";
import { Users } from "./entities/Users";
import * as bcrypt from "bcryptjs";

export const resolvers = {
  Query: {
    //getting candidates chosen for each course in hte report part..
    candidatesChosenPerCourse: async () => {
      const courseRepo = AppDataSource.getRepository(Course);
      const courses = await courseRepo.find({
        relations: ["applicationsSelectedFor", "applicationsSelectedFor.user", "applicationsSelectedFor.selectedCourses"],
      });
      //structure that frontend expects courseName + selected users
      return courses.map((course) => ({
        courseName: course.courseName,
        selectedCandidates: (course.applicationsSelectedFor ?? []).map((app) => ({
          ...app.user,
          appliedCourses: app.selectedCourses.map((c) => ({
            courseName: c.courseName,
            isSelected: true,  //bcz its the selected course...
          })), 
        })),
      }));
    },
    


   //candidates chosen for more thant 3 courses..
    candidatesChosenForMoreThanThree: async () => {
      const userRepo = AppDataSource.getRepository(Users);
      const users = await userRepo.find({
        relations: ["applications", "applications.selectedCourses", "applications.courses"],
      });
      return users
      //total number of selected ccourses for the user..
      .filter(user => {
        const totalSelected = user.applications?.reduce(
          (acc, app) => acc + (app.selectedCourses?.length || 0),
          0
        );
        return totalSelected > 3;
      })
      .map(user => ({
        ...user,
        appliedCourses: user.applications.flatMap(app =>
          app.courses.map(course => ({
            courseName: course.courseName,
            isSelected: app.selectedCourses.some(
              selected => selected.courseID === course.courseID
            ),
          }))
        ),
      }));
    },
    
    

    //candidates not chosen for nay course..
    candidatesNotChosen: async () => {
      const userRepo = AppDataSource.getRepository(Users);
      const users = await userRepo.find({
        relations: ["applications", "applications.selectedCourses", "applications.courses"],
      });
      return users
      //only needed studetns not hte staffs..
      .filter(user =>
        user.email.endsWith("@student.rmit.edu.au") &&
        user.applications?.every(app => (app.selectedCourses?.length ?? 0) === 0)
      )
      .map(user => ({
        ...user,
        appliedCourses: user.applications.flatMap(app =>
          app.courses.map(course => ({
            courseName: course.courseName,
            isSelected: app.selectedCourses.some(selected => selected.courseID === course.courseID),
          }))
        ),
      }));
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




  //edit the courses...
  Mutation: {
    
    //add a new course...
    addCourse: async (_: unknown, { input }: { input: Partial<Course> }) => {
      const courseRepo = AppDataSource.getRepository(Course);
      //won't add if the ocurse code already exisits.. 
      const existing = await courseRepo.findOneBy({ courseCode: input.courseCode });
      if (existing) {
        throw new Error("Course code already exists. Please choose a different code.");
      }
      const newCourse = courseRepo.create(input);
      return await courseRepo.save(newCourse);
    },



    //edit a course..
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



    //delete a course..
    deleteCourse: async (_: unknown, { courseID }: { courseID: number | string }) => {
      const courseRepo = AppDataSource.getRepository(Course);
      const result = await courseRepo.delete({ courseID: Number(courseID) });
      return (result.affected ?? 0) > 0;
    },

    login: async(_:unknown, {username, password} : {username: string, password: string})=>{
      const userRepo = AppDataSource.getRepository(Users);
      const user = await userRepo.findOneBy({username});

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
