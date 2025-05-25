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
    }
  }
};
