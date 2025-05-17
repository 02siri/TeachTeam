import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useAuth } from "@/context/AuthLogic";
import Link from "next/link";
import Image from "next/image";
import { BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  PolarRadiusAxis, 
  PolarAngleAxis, 
  PolarGrid, 
  RadarChart, 
  Radar, 
  Cell, 
  Legend} from 'recharts';


//home page
const Home = () => {

  //useRef hook to create a reference to the section element
  //this reference is used to check if the section is in view or not lter...
  const sectionRef = useRef(null);


  //useInView hook from framer-motion to check if the section is in view...
  //triggers before the element fully enters (100px outside viewport).
  const isInView = useInView(sectionRef, { once: true, margin: "100px" });


  //useAuth hook to get the current user and logout function
  //this hook is defined in the AuthLogic.tsx file...
  const {currentUserEmail} = useAuth();


  //useState hook to manage the state of the total applications...
  //this state is used to store the total number of applications submitted by tutors...
  const [totalApplications, setTotalApplications] = useState(0);



  //useState hook to manage the state of the application statistics...
  //this state is used to store the statistics of the applications submitted by tutors...
  const [applicationStats, setApplicationStats] = useState({
    courses: {},
    skills: {},
    roles: {},
    availability: {}
  });
  

  //useState hook to manage the state of the last updated time...
  //this state is used to store the last updated time of the application statistics...
  //the initial value is set to an empty string...
  const [lastUpdated, setLastUpdated] = useState("");

  interface Applicant {
      name?: string;
      email?: string;
      selectedCourses?: string[];
      courses?: { id: string; name: string }[];
      [key: string]: string | string[] | { id: string; name: string }[] | undefined;
  }
  
  const [mostChosen, setMostChosen] = useState<Applicant | null>(null);
  const [leastChosen, setLeastChosen] = useState<Applicant | null>(null);
  const [, setUnselectedApplicants] = useState<Applicant[]>([]);
  const [rankChartData, setRankChartData] = useState<{ name: string; count: number }[]>([]);
  const [selectionPieData, setSelectionPieData] = useState<{ name: string; value: number }[]>([]);


  //effect #1:summarize all tutor application data
  //useEffect hook to fetch the applications from local storage...
  //it fetches the applications from local storage and updates the application statistics...
  useEffect(() => {
    const applications = Object.keys(localStorage)
      .filter((key) => key.endsWith("_applicationData"))
      .map((key) => JSON.parse(localStorage.getItem(key) || "{}"));

    setTotalApplications(applications.length);

   
    
    //initialize the maps to store the statistics..
    const coursesMap: { [key: string]: { id: string; name: string; count: number } } = {};         //the coursesMap is used to store the courses and their count...   
    const skillsMap: { [key: string]: number } = {};         //the skillsMap is used to store the skills and their count...
    const rolesMap = {                                       //the rolesMap is used to store the roles and their count...
      Tutor: 0,
      "Lab Assistant": 0
    };
    const availabilityMap = {
      "Part-Time": 0,
      "Full-Time": 0
    };

    interface Course {
      id: string;
      name: string;
    }


    //loop through each application and populate the maps
    applications.forEach((app) => {
      app.courses?.forEach((course: Course) => {
        if (!coursesMap[course.id]) {
          coursesMap[course.id] = {
            id: course.id,
            name: course.name,
            count: 1,
          };
        } else {
          coursesMap[course.id].count += 1;
        }
      });

      //count skills
      app.skills?.forEach((skill: string) => {
        skillsMap[skill] = (skillsMap[skill] || 0) + 1;
      });

      //count roles
      app.role?.forEach((r: string) => {
        if (r === "Tutor" || r === "Lab Assistant") {
          rolesMap[r]++;
        }
      });

      //saave summary statistics... 
      if (app.availability === "Part-Time" || app.availability === "Full-Time") {
        availabilityMap[app.availability as "Part-Time" | "Full-Time"]++;
      }
    });
    //convert coursesMap to an array of objects
    setApplicationStats({
      courses: coursesMap,
      skills: skillsMap,
      roles: rolesMap,
      availability: availabilityMap
    });



    //set the last updated time to the current time
    //this is used to show the last updated time of the application statistics...
    const formatted = new Date().toLocaleString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    setLastUpdated(formatted);
  }, []);
  
  


  //effect 2: useEffect hook to fetch the selected applicants from local storage...
  // it fetches the selected applicants from local storage and updates the most and least chosen applicants...
  // it also updates the unselected applicants based on the selection count...
  // it also updates the rank chart data and selection pie data...
  interface Applicant {
    name?: string;
    email?: string;
    selectedCourses?: string[];
    courses?: { id: string; name: string }[];
    skills?: string[];
    role?: string[];
    availability?: string;
  }
  
  
 useEffect(() => {
  const allApplicants: Applicant[] = [];
   const selectedApplicantsString = localStorage.getItem("selectedApplicants");
   const selectedApplicants = selectedApplicantsString ? JSON.parse(selectedApplicantsString) : [];

   const selectionCountMap: Record<string, number> = {};
   //collect all applicant data..
   Object.keys(localStorage).forEach((key) => {
     if (key.endsWith("_applicationData")) {
       const data = JSON.parse(localStorage.getItem(key) || "{}");
       allApplicants.push(data);
     }
   });

   //count frequency of selected courses..
  const courseCountMap: Record<string, number> = {};
  (selectedApplicants as Applicant[]).forEach((app) => {
    const courses = app.selectedCourses || [];
    courses.forEach((course: string) => {
      const courseCode = course.split(" - ")[0]; // Get only the course code
      courseCountMap[courseCode] = (courseCountMap[courseCode] || 0) + 1;
    });
  });


  const chartData = Object.entries(courseCountMap).map(([name, count]) => ({
    name,
    count,
  }));
  setRankChartData(chartData);


  const courseFrequencyMap: Record<string, number> = {};
  (selectedApplicants as Applicant[]).forEach((app) => {
    (app.selectedCourses || []).forEach((course: string) => {
      const courseCode = course.split(" - ")[0];
      courseFrequencyMap[courseCode] = (courseFrequencyMap[courseCode] || 0) + 1;
    });
  });
  (selectedApplicants as Applicant[]).forEach((app) => {
    const id = app.email;
    if (id) {
      selectionCountMap[id] = (selectionCountMap[id] || 0) + 1;
    }
  });
  let most: Applicant | null = null;
  let least: Applicant | null = null;

  let highestScore = -Infinity;
  let lowestScore = Infinity;
  (selectedApplicants as Applicant[]).forEach((app) => {
    const courses = app.selectedCourses || [];
    if (courses.length === 0) return;
    const totalScore = courses.reduce((acc: number, course: string) => {
      const courseCode = course.split(" - ")[0];
      return acc + (courseFrequencyMap[courseCode] || 0);
    }, 0);
    if (totalScore > highestScore) {
      highestScore = totalScore;
      most = app;
    }
    if (totalScore < lowestScore) {
      lowestScore = totalScore;
      least = app;
    }
  });
  setMostChosen(most);
  setLeastChosen(least);


  const rankData = Object.entries(courseFrequencyMap).map(([name, count]) => ({
    name,
    count,
  }));
  setRankChartData(rankData);


  const unselected = allApplicants.filter((app: Applicant) =>
    !selectedApplicants.some((s: Applicant) => s.email === app.email)
  );
  setUnselectedApplicants(unselected);
  setSelectionPieData([
    { name: "Selected", value: selectedApplicants.length },
    { name: "Not Selected", value: allApplicants.length - selectedApplicants.length },
  ]);
}, []);


  return (
    //Main component
    //this component is responsible for rendering the home page of the application...
    <div className="min-h-screen flex flex-col">
      <motion.header 
      initial={{ opacity: 0, y: -40 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative h-screen flex items-center justify-center text-white bg-black overflow-hidden"
    >
      {/*ackground gradient circles */}
      <div className="absolute left-[-150px] top-1/2 transform -translate-y-1/2 w-[500px] h-[500px] bg-blue-100 opacity-20 blur-[160px] rounded-full z-0" />
      <div className="absolute right-[-150px] top-1/2 transform -translate-y-1/2 w-[500px] h-[500px] bg-cyan-200 opacity-20 blur-[160px] rounded-full z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/30 to-white z-0 pointer-events-none" />
      {/* FLEX CONTAINER */}
      <div className="relative container mx-auto flex flex-col-reverse md:flex-row justify-between items-center max-w-7xl">
        
      {/* LEFT: TEXT SECTION */}
      <div className="text-center md:text-left max-w-xl">
        <motion.h1 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
        className="text-5xl md:text-7xl font-extrabold leading-tight text-white">
          Welcome to <span className="text-blue-300">Teach Team</span>
        </motion.h1>
        
        <motion.p 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
        className="mt-6 text-xl md:text-2xl text-blue-100">
          Connecting lecturers with top-rated tutors to empower classrooms.
        </motion.p>
        
        {/* Button apply now for tutors and hire now for lecturer */}
        {currentUserEmail && (
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8">
            
            {currentUserEmail.endsWith("@student.rmit.edu.au") ? (
              <Link href="/tutor-dashboard">
              <button className="relative inline-block text-white font-semibold py-3 px-8 rounded-full transition duration-300 group overflow-hidden shadow-lg border border-white cursor-pointer"
                style={{
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#0E4C92] to-[#002147] transition-all duration-300 group-hover:from-[#002147] group-hover:to-[#0E4C92] rounded-full"></span>
                <span className="relative z-10">Apply Now</span>
              </button>
            </Link>
              
            ) : currentUserEmail.endsWith("@staff.rmit.edu.au") ? (
              <Link href="/lecturer-dashboard">
              <button className="relative inline-block text-white font-semibold py-3 px-8 rounded-full transition duration-300 group overflow-hidden shadow-lg border border-white"
                style={{
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#0E4C92] to-[#002147] transition-all duration-300 group-hover:from-[#002147] group-hover:to-[#0E4C92] rounded-full"></span>
                <span className="relative z-10">Hire Now</span>
              </button>
            </Link>
          ) : null}
          </motion.div>
        )}
        </div>
        
        {/* RIGHT: IMAGE STACK */}
        <div className="flex flex-row items-center">
        <Image src="/home.png" alt="Teach Team image" width={500} height={500} />
        </div>
      </div>
      
    </motion.header>
    







    {/* sign-in Box */}
    {/* this box is only visible when the user is not logged in */}
    {/* it contains a heading, description, and a button to sign in */}
    {!currentUserEmail && (
  <main
    className="flex-grow flex items-center justify-center min-h-screen w-full px-6 bg-cover bg-center"
    style={{ backgroundImage: "url('/bg.jpg')" }}
  >
    {/* Animated Sign-in Box */}
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="bg-white p-12 rounded-2xl shadow-2xl max-w-2xl w-full text-center"
    >
      {/* Section Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="text-4xl font-bold text-gray-800"
      >
        Get Started
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-4 text-lg text-gray-600 leading-relaxed"
      >
        Sign in to join our exclusive platform for lecturers and tutors. Tutors can showcase
        their skills while lecturers review, shortlist, and hire the perfect match for their classes.
      </motion.p>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-8"
      >
        <Link href="/login">
          <button
            className="relative inline-block text-white font-semibold py-3 px-8 rounded-full transition duration-300 group overflow-hidden shadow-lg border border-white"
            style={{ boxShadow: "0 0 15px rgb(71, 71, 71)" }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#0E4C92] to-[#002147] transition-all duration-300 group-hover:from-[#002147] group-hover:to-[#0E4C92] rounded-full"></span>
            <span className="relative z-10">Sign In</span>
          </button>
        </Link>
      </motion.div>
    </motion.div>
  </main>
)}














{/* Tutor Application Statistics Section */}
{/* This section is responsible for rendering the tutor application statistics... */}
<section
  ref={sectionRef}
  className="w-full py-20 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex justify-center items-center px-4"
>
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 1 }}
    className="bg-white rounded-2xl p-10 shadow-2xl max-w-7xl w-full"
  >
    <div className="text-center">
      <h3 className="text-3xl font-bold text-gray-800 mb-2">
        Application Statistics
      </h3>
      <p className="text-lg text-gray-600 mb-6">
        See the number of tutor applications across different categories.
      </p>
      <p className="text-lg font-semibold text-blue-900">
        Total Applications: {totalApplications}
      </p>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>
    </div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

  {/* Pie Chart for roles */}
  {/* This chart shows the distribution of roles chosen by applicants */}
  {/* The chart is animated when it comes into view */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={isInView ? { opacity: 1, scale: 1 } : {}}
    transition={{ delay: 0.1, duration: 0.6 }}
    className="bg-gray-50 rounded-xl p-4 shadow-lg hover:scale-105 transform transition-transform duration-300"
  >
    <h4 className="text-md font-bold mb-2 text-gray-700 text-center">Roles Chosen</h4>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={Object.entries(applicationStats.roles).map(([name, count]) => ({
              name,
              value: count,
              fill: name === "Tutor" ? "#F59E0B" : "#14B8A6"
            }))}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={30}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {Object.entries(applicationStats.roles).map(([name], index) => (
              <Cell
                key={`cell-${index}`}
                fill={name === "Tutor" ? "#0E4C92" : "#002147"}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [`${value} applicants`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </motion.div>

  {/* Radar Chart for Skills */}
  {/* This chart shows the distribution of skills chosen by applicants */}
  {/* The chart is animated when it comes into view */}
  {/* The chart is responsive and adjusts to the size of the container */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={isInView ? { opacity: 1, scale: 1 } : {}}
    transition={{ delay: 0.2, duration: 0.6 }}
    className="bg-gray-50 rounded-xl p-4 shadow-lg hover:scale-105 transform transition-transform duration-300"
  >
    <h4 className="text-md font-bold mb-2 text-gray-700 text-center">Top Skills</h4>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={90} data={Object.entries(applicationStats.skills).map(([name, count]) => ({ name, count }))}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar name="Skills" dataKey="count" stroke="#002147" fill="#0E4C92" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>

  {/* Pie Chart for Availability */}
  {/* This chart shows the distribution of availability chosen by applicants */}
  {/* The chart is animated when it comes into view */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={isInView ? { opacity: 1, scale: 1 } : {}}
    transition={{ delay: 0.3, duration: 0.6 }}
    className="bg-gray-50 rounded-xl p-4 shadow-lg hover:scale-105 transform transition-transform duration-300"
  >
    <h4 className="text-md font-bold mb-2 text-gray-700 text-center">Availability</h4>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={Object.entries(applicationStats.availability).map(([name, count]) => ({
              name,
              value: count,
              fill: name === "Full-Time" ? "#0E4C92" : "#002147"
            }))}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={30}
            label={({ name, value }) => `${name}: ${value}`}
          />
          <Tooltip formatter={(value: number, name: string) => [`${value} applicants`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </motion.div>

  {/* Bar Chart for Courses */}
  {/* This chart shows the distribution of courses chosen by applicants */}
  {/* The chart is animated when it comes into view */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={isInView ? { opacity: 1, scale: 1 } : {}}
    transition={{ delay: 0.4, duration: 0.6 }}
    className="bg-gray-50 rounded-xl p-4 shadow-lg transform transition-transform duration-300 hover:scale-[1.03] col-span-1 sm:col-span-2 lg:col-span-3"
  >
    <h4 className="text-md font-bold mb-2 text-gray-700 text-center">Most Applied Courses</h4>
    <div className="h-52 sm:h-64"> 
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={Object.values(applicationStats.courses)}
          margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
          barSize={150}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-10} textAnchor="end" interval={0} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#0E4C92" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>


    </div>
  </motion.div>
</section>










{/* Lecturer Statistics Section */}
{/* This section is responsible for rendering the lecturer statistics... */}
{/* The section is animated when it comes into view */}
{/* The section contains the most and least chosen applicants, pie chart, and bar chart */}
<section
  ref={sectionRef}
  className="w-full py-20 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex justify-center items-center px-4"
>
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 1 }}
    className="bg-white rounded-2xl p-10 shadow-2xl max-w-7xl w-full"
  >
    <div className="text-center">
      <h3 className="text-3xl font-bold text-gray-800 mb-2">Lecturer Insights</h3>
      <p className="text-lg text-gray-600 mb-6">Visual insights on applicant selection</p>
      <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>
    </div>

    {/* Most & Least Chosen Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {/* Most Chosen Applicant */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.03 }}
        className="bg-green-50 border-2 border-green-300 rounded-xl p-6 shadow-xl hover:shadow-green-900 transition-all duration-300"
      >
        <h4 className="text-lg font-bold text-green-800 text-center mb-2">Most Chosen Applicant</h4>
        <p className="text-center text-gray-700 font-semibold text-lg">
          {mostChosen?.name || "N/A"}
        </p>
        {(mostChosen?.selectedCourses ?? []).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex flex-wrap justify-center gap-2"
          >
            {(mostChosen?.selectedCourses ?? []).map((c, idx) => (
              <motion.span
                key={idx}
                whileHover={{ scale: 1.1 }}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold shadow-sm"
              >
                {c.split(" - ")[0]}
              </motion.span>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Least Chosen Applicant */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.03 }}
        className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 shadow-xl hover:shadow-yellow-900 transition-all duration-300"
      >
        <h4 className="text-lg font-bold text-yellow-800 text-center mb-2">Least Chosen Applicant</h4>
        <p className="text-center text-gray-700 font-semibold text-lg">
          {leastChosen?.name || "N/A"}
        </p>
        {(leastChosen?.selectedCourses ?? []).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex flex-wrap justify-center gap-2"
          >
            {(leastChosen?.selectedCourses ?? []).map((c, idx) => (
              <motion.span
                key={idx}
                whileHover={{ scale: 1.1 }}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold shadow-sm"
              >
                {c.split(" - ")[0]}
              </motion.span>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="bg-gray-50 rounded-xl p-4 shadow-lg hover:scale-105 transform transition-transform duration-300"
      >
        <h4 className="text-md font-bold mb-4 text-center text-gray-700">Selected vs Not Selected</h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={selectionPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                <Cell fill="#0E4C92" />
                <Cell fill="#002147" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="bg-gray-50 rounded-xl p-4 shadow-lg hover:scale-105 transform transition-transform duration-300"
      >
        <h4 className="text-md font-bold mb-4 text-center text-gray-700">
          Most Hired Courses
        </h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...rankChartData].sort((a, b) => b.count - a.count).slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-12} textAnchor="end" interval={0} />
              <YAxis domain={[0, 8]} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0E4C92" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  </motion.div>
</section>



    </div>
  );
};

export default Home;
