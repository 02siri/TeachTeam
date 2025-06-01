import request from 'supertest';
import express from 'express';
import { ApplicationController } from '../controller/ApplicationController';



//mocking the repositories used in ApplicationController...
const mockUserRepo = { findOneByOrFail: jest.fn() };
const mockCourseRepo = { find: jest.fn() };
const mockAppRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), findOneBy: jest.fn() };
const mockSkillRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
const mockCredentialRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };




//mocking the appdataSource to return hte mocked repositories...
jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: (entity: any) => {
      switch (entity.name) {
        case 'Users': return mockUserRepo;
        case 'Course': return mockCourseRepo;
        case 'Application': return mockAppRepo;
        case 'Skills': return mockSkillRepo;
        case 'AcademicCredential': return mockCredentialRepo;
        default: return {};
      }
    }
  }
}));




//express app setup fr testing...
const app = express();
app.use(express.json());
app.post('/applications', ApplicationController.createApplication);
app.get('/applications', ApplicationController.getAllApplications);





//test suite for ApplicationController...
describe('ApplicationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });




  //test invalid previous role format...
  it('should return 400 for invalid previousRoles format', async () => {
    const res = await request(app).post('/applications').send({
      email: "john@student.rmit.edu.au",
      previousRoles: "Not an array",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid previousRoles format/);
  });





  //no matching course are found in the backend... 
  it('should return 404 if no matching courses are found', async () => {
    mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 1, email: 'john@student.rmit.edu.au' });
    mockCourseRepo.find.mockResolvedValue([]);
    const res = await request(app).post('/applications').send({
      email: "john@student.rmit.edu.au",
      role: ["Tutor"],
      courses: ["COSC9999"],
      previousRoles: [],
      availability: "morning",
      skills: [],
      academicCred: [],
      timestamp: new Date().toISOString(),
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No matching courses found/);
  });





  //test create application...
  it('should create application successfully with valid data', async () => {
    mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 1, email: 'sruthy@student.rmit.edu.au' });
    mockCourseRepo.find.mockResolvedValue([{ courseCode: "COSC2758" }]);
    mockAppRepo.create.mockImplementation((data) => data);
    mockAppRepo.save.mockImplementation((data) => ({ ...data, applicationId: 1 }));
    const res = await request(app).post('/applications').send({
      email: "sruthy@student.rmit.edu.au",
      role: ["Tutor"],
      courses: ["COSC2758"],
      previousRoles: ["Lab Assistant"],
      availability: "morning",
      skills: ["JS"],
      academicCred: [{ qualification: "BSc", institution: "RMIT", year: 2023 }],
      timestamp: new Date().toISOString(),
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Application submitted");
    expect(res.body).toHaveProperty("applicationId");
  });





  //test create application with missing email...
  it('should return 200 and list all applications', async () => {
    mockAppRepo.find.mockResolvedValue([{ applicationId: 1, user: { email: "a@rmit.edu.au" } }]);
    const res = await request(app).get('/applications');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
