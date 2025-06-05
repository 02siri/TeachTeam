import { gql } from "graphql-tag";

//type is like an interface in TypeScript, it defines the shape of User, AppliedCourse, CandidatesPerCoruse...
//type Query: read-only entry points.. jsut getting..
//type input is for input fielfs for muttations.. for adding editing and delting courses..
//type mutation is write/update/delete operations...
export const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    dateOfJoining: String!
    assignedCourses: [Course!]!
    isBlocked: Boolean!
    appliedCourses: [AppliedCourse!]
  }

  type AppliedCourse {
    courseName: String!
    isSelected: Boolean!
  }

  type CandidatesPerCourse {
    courseName: String!
    selectedCandidates: [User]
  }

  type Course {
    courseID: ID!
    courseCode: String!
    courseName: String!
    semester: String!
    description: String!
    lecturers: [User!]!
  }

  
  type Query {
    candidatesChosenPerCourse: [CandidatesPerCourse]
    candidatesChosenForMoreThanThree: [User]
    candidatesNotChosen: [User]
    getCourses: [Course!] 
    getLecturers : [User!]! 
    getAllUsers: [User!]!  
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
    blockUsers(userId: ID!, isBlocked:Boolean!): Boolean!
  }

`;
