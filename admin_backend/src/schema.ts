import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    dateOfJoining: String!
    assignedCourses: [Course!]!
  }

  type CandidatesPerCourse {
    courseName: String!
    selectedCandidates: [User]
  }

  type Query {
    candidatesChosenPerCourse: [CandidatesPerCourse]
    candidatesChosenForMoreThanThree: [User]
    candidatesNotChosen: [User]
    getCourses: [Course!] 
    getLecturers : [User!]!   
  }


  type Course {
    courseID: ID!
    courseCode: String!
    courseName: String!
    semester: String!
    description: String!
    lecturers: [User!]!
  }

  input CourseInput {
    courseCode: String!
    courseName: String!
    semester: String!
    description: String!
  }

  type Mutation {
    addCourse(input: CourseInput!): Course
    editCourse(courseID: ID!, input: CourseInput!): Course
    deleteCourse(courseID: ID!): Boolean
    login(username:String!, password: String!): Boolean
    assignLectToCourses(userId: ID!, courseIds: [ID!]!): Boolean!
  }

`;
