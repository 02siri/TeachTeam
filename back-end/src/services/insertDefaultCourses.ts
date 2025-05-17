
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";

export const insertDefaultCourses = async () => {
  const courseRepo = AppDataSource.getRepository(Course);

  const defaultCourses = [
    { courseCode: "COSC2758", courseName: "Full Stack Development" },
    { courseCode: "COSC2673", courseName: "Machine Learning" },
    { courseCode: "COSC2391", courseName: "Further Programming" },
    { courseCode: "COSC2123", courseName: "Algorithms and Analysis" },
    { courseCode: "COSC3045", courseName: "Essentials of Computing" },
    { courseCode: "COSC2299", courseName: "SE Process & Tools" },
    { courseCode: "COSC1085", courseName: "Software Testing" },
    { courseCode: "COSC2625", courseName: "Intro to Cybersecurity" },
  ];

  const semester = "2";
  const description = "Prefilled default course";

  for (const course of defaultCourses) {
    const existing = await courseRepo.findOneBy({ courseCode: course.courseCode });
    if (!existing) {
      const newCourse = courseRepo.create({
        courseCode: course.courseCode,
        courseName: course.courseName,
        semester,
        description,
      });
      await courseRepo.save(newCourse);
      console.log(`Inserted course: ${course.courseCode}`);
    }
  }
};