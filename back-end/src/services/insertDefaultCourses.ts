
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";

export const insertDefaultCourses = async () => {
  const courseRepo = AppDataSource.getRepository(Course);

  const defaultCourses = [
    {
      courseCode: "COSC2758",
      courseName: "Full Stack Development",
      semester: "2",
      description: "Covers backend and frontend technologies",
    },
    {
      courseCode: "COSC2673",
      courseName: "Machine Learning",
      semester: "1",
      description: "Introduction to ML concepts and models...",
    },
    {
      courseCode: "COSC2391",
      courseName: "Further Programming",
      semester: "2",
      description: "Advanced OOP and design patterns..",
    },
    {
      courseCode: "COSC2123",
      courseName: "Algorithms and Analysis",
      semester: "1",
      description: "Covers algorithm design and complexity...",
    },
    {
      courseCode: "COSC3045",
      courseName: "Essentials of Computing",
      semester: "2",
      description: "Foundational computing and IT skills..",
    },
    {
      courseCode: "COSC2299",
      courseName: "SE Process & Tools",
      semester: "1",
      description: "Covers Agile, Git, and CI/CD tools...",
    },
    {
      courseCode: "COSC1085",
      courseName: "Software Testing",
      semester: "1",
      description: "Manual and automated software testing...",
    },
    {
      courseCode: "COSC2625",
      courseName: "Intro to Cybersecurity",
      semester: "2",
      description: "Security principles and best practices..",
    },
  ];

  for (const course of defaultCourses) {
    const existing = await courseRepo.findOneBy({ courseCode: course.courseCode });

    if (existing) {
      existing.courseName = course.courseName;
      existing.semester = course.semester;
      existing.description = course.description;
      await courseRepo.save(existing);
      console.log(`Updated course: ${course.courseCode}`);
    } else {
      const newCourse = courseRepo.create(course);
      await courseRepo.save(newCourse);
      console.log(`Inserted course: ${course.courseCode}`);
    }
  }
};