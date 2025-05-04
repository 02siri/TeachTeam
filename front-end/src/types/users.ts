//properties of User -> email & password fields
export type User = {
     email: string,
    password: string,
};

//dummy data (list of users)
export const DEFAULT_USERS : User[] = [
    {email: "srishti@student.rmit.edu.au", password: "Sk1234#abc"}, //Valid -> correct username & password
    {email: "sruthy@staff.rmit.edu.au", password: "Sr1234#abc"},    //Valid -> correct username & password
    {email: "harsh@student.rmit.edu.au", password: "Hr1234#abc"},   //Valid -> correct username & password
    {email: "david@staff.rmit.edu.au", password: "Da1234#abc"},     //Valid -> correct username & password
    {email: "joe@student.rmit.edu.au", password: "Sk1234#abc"},
    {email: "ariana@student.rmit.edu.au", password: "Sk1234#abc"},
    {email: "mary@student.rmit.edu.au", password: "Sk1234#abc"},
    {email: "william@student.rmit.edu.au", password: "Sk1234#abc"}
];
