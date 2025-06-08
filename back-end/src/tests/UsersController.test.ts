import request from 'supertest';
import express from 'express';
import { UsersController } from '../controller/UsersController';

//mocking findOneBy and save methods of the repository....
const mockRepo = {
  findOneBy: jest.fn(),
  save: jest.fn(),
};


//mocking the AppDataSource to return the mock repository....
jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: () => mockRepo,
  },
}));



//express app setup for testing...
const app = express();
app.use(express.json());



//importing the UsersController and setting up the route..
const controller = new UsersController();
app.post('/users', (req, res) => controller.createUser(req, res));



//test for UsersController's createUser method...
describe("UsersController - createUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  //missing required fields,...
  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post('/users').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });



  //invalid email format...
  it("should return 400 for invalid email format", async () => {
    const res = await request(app).post('/users').send({
      firstName: "Mark",
      lastName: "Smith",
      username: "marksmith",
      email: "mark@gmail.com",   //invalid email format..
      password: "Password123!",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Email must end/);
  });




    //weak password... like when password does not meet complexity/legth requirements..
  it("should return 400 for weak password", async () => {
    const res = await request(app).post('/users').send({
      firstName: "David",
      lastName: "Smith",
      username: "davidsmith",
      email: "david@student.rmit.edu.au",
      password: "short",     //this is too short.... so its a weak password..
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Password must have atleast 10 characters/);
  });





  //email already exists...
  it("should return 409 if email already exists", async () => {
    const userData = {
      firstName: "Sruthy",
      lastName: "T R",
      username: "sruthyt",
      email: "sruthy@student.rmit.edu.au",
      password: "Secure@12345",
    };
    //using the existing user found in database...
    mockRepo.findOneBy.mockResolvedValueOnce({ email: userData.email });
    const res = await request(app).post('/users').send(userData);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/Email already exists/);
  });





  //valid user creation.... like all fields are valid and user is successfully created..
  it("should return 201 when a valid user is created", async () => {
    const userData = {
      firstName: "Anna",
      lastName: "Lee",
      username: "annalee",
      email: "anna@student.rmit.edu.au",
      password: "Valid@12345",
    };
    //no existing user..
    mockRepo.findOneBy.mockResolvedValueOnce(null);
    //saving the user and returning new user object..
    mockRepo.save.mockResolvedValueOnce({
      ...userData,
      password: undefined,
      id: 1,
    });
    const res = await request(app).post('/users').send(userData);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("email", "anna@student.rmit.edu.au");
    expect(res.body).not.toHaveProperty("password");  
  });
});
