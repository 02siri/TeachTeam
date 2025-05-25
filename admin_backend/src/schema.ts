import { gql } from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    dateOfJoining: String!
  }

  type CandidatesPerCourse {
    courseName: String!
    selectedCandidates: [User]
  }

  type Query {
    candidatesChosenPerCourse: [CandidatesPerCourse]
    candidatesChosenForMoreThanThree: [User]
    candidatesNotChosen: [User]
  }
`;
