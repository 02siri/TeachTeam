
# TeachTeam

<img width="1280" height="400" alt="logo1" src="https://github.com/user-attachments/assets/c5416bd3-b6d2-4a2a-87e4-fcdddbcb578f" />

The Tutor Hiring Platform is an innovative solution designed in collaboration with my teammate **Sruthy**, to optimize the **tutor recruitment process** for **RMIT lecturers, students, and administrators**. 

This application provides a user-friendly interface and streamlined functionalities that cater to the unique needs of each user group.


## Features

**Admin Dashboard**

- Course Management: Create, edit, or delete courses, and assign them to lecturers, which is reflected in their profiles.
- User Management: Block or unblock users effectively, ensuring that blocked users cannot access the platform.
- Reporting: Generate live reports such as:
    - Candidates per course
    - Candidates selected for more than three courses
    - Candidates not selected at all
- Admin Credentials: Access using default admin login: admin / admin.

**Lecturer Dashboard**

- Course Access: Login using an email with the @staff.rmit.edu.au domain.
- Application Management: View and filter tutor applicants for assigned courses and publish selected candidates.
- Analytics: Visualize selected tutors through dynamic charts.

**Tutor Dashboard**

- Application Process: Apply for up to two tutor roles with restrictions on duplicate course applications.
- Profile Overview: View submitted applications along with qualifications and skills.
- Submission Lock: The dashboard restricts access after two application submissions.
- Application Status Tracking: Monitor the status of applications via visual representations.

**Home Page**

- Analytics Display: Utilize Recharts to showcase analytics reflecting role distribution and course popularity for both lecturers and tutors.

**Unit Testing**

Conducted comprehensive unit tests using Jest to ensure backend controller reliability.
## Tech Stack

**Frontend:** 
- Next.js
- React.js
- TypeScript
- Chakra UI
- TailwindCSS
- Framer Motion
- Lordicon
- Recharts

**Backend:**
- Express.js 
- Node.js
- MySQL
- TypeORM
- GraphQL

**Testing:**
- Jest


## Run Locally

Clone the project

```bash
  git clone https://github.com/02siri/TeachTeam.git
```

**TeachTeam Frontend:**
```
bash
cd front-end
npm install
npm run build
npm start
```

**TeachTeam Backend:**
```
bash
cd back-end
npm install
npm run build
npm start
```

**Admin Frontend:**
```
bash
cd admin_frontend
npm install
npm run build
npm start
```

**Admin Backend:**
```
bash
cd admin_backend
npm install
npm run build
npm start
```
## Assets and Resources

- Images: Icons and visuals sourced from Freepik.
- AI-Generated Faces: Custom designs created via Canva.
- Icons/Animations: Designed using Lordicon.
