export type UserType = "candidate" | "lecturer";

export const getUserTypeFromEmail = (email: string): UserType => {
  if (email.endsWith("@student.rmit.edu.au")) {
    return "candidate";
  }

  if (email.endsWith("@staff.rmit.edu.au")) {
    return "lecturer";
  }

  throw new Error("Invalid RMIT email. Must be student or staff.");
};
