import { AppDataSource } from "./datasource";
import { Course } from "./entities/Course";
import { Users } from "./entities/Users";

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
      return await courseRepo.find();
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
  },
};
