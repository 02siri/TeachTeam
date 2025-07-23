Tutor Hiring Platform

![App Logo](teach-team/public/logo1.png)



**Overview**
This project is a tutor hiring platform designed for lecturers to review tutor applications and make selections. It includes a landing page with analytics, a tutor application dashboard, and a lecturer dashboard for managing applicants. A profile page separate for both tutors and lecturers. An Admin dashboard where the admins can manage the courses[add, edit, and delete], assign courses to the lecturers, block and unblock users, see the reports for the candidates selected per courses, candidates selected for more than 3 courses, candidates not chosen for any courses.



**Unit Testing**
* As part of the HD task, we have made 9 unit tests for the backend of the Teach Team using Jest where we tested the controllers which is the most integral part to make the connection.
* Tests are inside back-end/src/tests -> ApplicationController.test.ts, and UsersController.test.ts
* Have provided what each tests do in the comments
* Run -> cd back-end  -> npm test


**Tech Stack**
* Language: TypeScript
* Framework: Next.js (Pages Router)
* Styling: Chakra UI, TailwindCSS
* Animations: Framer Motion, Lordicon
* Charts/Graphs: Recharts
* Test: Jest
* Backend: MySQL, TypeORM, Express, NodeJS
* Admin: graphQL, 

**HOW TO RUN?**

* TT Frontend:    cd front-end -> npm install -> npm run build -> npm start
* TT Backend:     cd back-end -> npm install -> npm run build -> npm start
* Admin-Frontend: cd admin_frontend -> npm install -> npm run build -> npm start
* Admin-Backend:  cd admin_backend -> npm install -> npm run build -> npm start
* Port Info: 
  * TT Frontend running in the port: http://localhost:3000
  * TT Backend API: http://localhost:3001
  * admin_frontend: http://localhost:3002
  * admin_backend: http://localhost:3003
* Very IMP: Change the mysql username, database and password for datasource in both Teach Team backend and Admin Backend

**Collaboration** 
* All features and responsibilities were equally divided and completed by both members.
* All branches were committed and pushed to GitHub.


**Details on Admin Dashbaord**
* Run the Admin ports.. 
* login using the credential :username: admin and password: admin 
* Now all the admin features will be working and then TT will be getting updated according to that.


**ERD**
* Backend -> we have uploaded ERD from PHP admin with extra N..N table and then we have also included the ERD without extra tables made by us in the backend of TT. 

**WORKING**
* Register: no fields should be left empty. @student.rmit.edu.au for students, @staff.rmit.edu.au for staffs
* Login: login with email and password
* HOme page you can see the charts and graphs for hte Lecturers and the Tutors..
* Tutor Dashboard: Tutor dashboard is accessible via login with @student.rmit.edu.au 
     * Profile is also available showing application 1 and application 2, and skills and qualification as well
     * Studetns can apply for 2 roles separately for the 2 chances of applicaiton they got, and and the courses they applied for in one role will be blocked for the 2nd application.
     * Once they submit 2 application we are not allowing them to apply again. 
     * In the profile they can track the applicaiton details
     * See the charts for tutor and lecturer.
* Lecturer Dashboard: Lecturer dashboard id accessible via login with @staff.rmit.edu.au
    * Profile will be showing the assigned courses for thrm through the admin dashboard
    * When they go to lecturer dashboard, click select applicants, then select the boxes for the applicaiton and then the courses they are hiring for and then publish the selected
    * all the filtering and sorting is done per the specification
    * charts and graph for the lecturers will be fixing according to the selection.
* Admin
  * Login via admin - admin
  * HOme page
  * assign courses for the lecturers [will be showing in the profile of TT for the lecturers]
  * block users [won't be allowing the blocked users to login again] 
  * Add new courses, edit courses, delete [all these will be updatign in the TT, you can double check via the tutor dashboard applicaiton form]
  * Report [every time a person is selected or apply the report will be updating and showing the statistics correctly to the admin]
* Made 9 tests all are working as well....



**Tools and Communication**
* Github Repository Link: https://github.com/rmit-fsd-2025-s1/s3959795-s3988110-a1
* Teams: https://teams.microsoft.com/l/channel/19%3A8GV1I6DRUxQ2LnBUzpdGhI5DbSWSdVZCE73DCuQUSrg1%40thread.tacv2/General?groupId=79c13ced-ec20-43ae-9681-ff4054b9299e&tenantId=d1323671-cdbe-4417-b4d4-bdb24b51316b


**Assets**
* Images:
    * Freepik - https://www.freepik.com/free-photos-vectors/
    * AI-generated tutor and lecturer images were edited using Canva for inclusion in the README and UI.
    * Lordicon animation : https://cdn.lordicon.com/aksvbzmu.json
    * We have researched about the HD graphQL using last 2 weeks lab materials, refering so many resources regarding this from web, and implemented with the guidance of tutor after multiple struggles.

**IMP Note:**
* Along with node_modules, .next folder was also deleted 
