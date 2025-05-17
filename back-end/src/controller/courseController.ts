import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";

const courseRepo = AppDataSource.getRepository(Course);

export const getAllCourses = async (req: Request, res: Response) => {
    try {
      const courses = await AppDataSource.getRepository(Course).find();
      res.json(courses);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: "Failed to fetch courses", error: err.message });
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  };

  //might need it for admin will see..
export const createCourse = async (req: Request, res: Response) => {
  const { courseCode, courseName, semester, description } = req.body;
  try {
    const course = courseRepo.create({ courseCode, courseName, semester, description });
    await courseRepo.save(course);
    res.status(201).json(course);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: "Failed to create course", error: err.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred" });
    }
  }
};

//might be helpful for admin..
export const updateCourse = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { courseCode, courseName, semester, description } = req.body;

  try {
    const course = await courseRepo.findOneBy({ courseID: id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.courseCode = courseCode;
    course.courseName = courseName;
    course.semester = semester;
    course.description = description;

    await courseRepo.save(course);
    res.json(course);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: "Failed to update course", error: err.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred" });
    }
  }
};

//might be helpful for admin...
export const deleteCourse = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const course = await courseRepo.findOneBy({ courseID: id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    await courseRepo.remove(course);
    res.json({ message: "Course deleted" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: "Failed to delete course", error: err.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred" });
    }
  }
};
