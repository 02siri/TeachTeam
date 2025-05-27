import { useState, useEffect, useCallback } from "react";
import { motion} from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
} from "@chakra-ui/react";

import {tutorApi, Tutor} from "../services/api";

/**
 * Extended applicant interface to combine tutor details for frontend
 */
interface DisplayApplicant extends Tutor{
  name: string;
  formattedCourses : string[];
  academicCred : string;
}

// Create a motion-enabled Box component using Framer Motion for animations
const MotionBox = motion(Box);

const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * LecturerDashboard Component
 * 
 * This dashboard allows lecturers to:
 * - View all tutor applicants
 * - Filter and sort applicants
 * - Select applicants for courses
 * - Rank applicants by preference
 * - Add comments to applications
 * - Submit final selections
 */
const LecturerDashboard = () => {
  const toast = useToast();

  // Main state management
  const [applicants, setApplicants] = useState<DisplayApplicant[]>([]); // All applicants in the system
 const [rankErrors, setRankErrors] = useState<{ [key: string]: string }>({}); // Error messages for invalid rankings
  const [inputErrors, setInputErrors] = useState<{ name?: string }>({}); // Validation errors for input fields
  
  // Filter and sort state
  const [filter, setFilter] = useState({
    course: "",
    availability: "",
    skill: "",
    name: "",
  });
  const [sortedBy, setSortedBy] = useState<string | null>(null); // Current sort parameter
  
  // UI state controls
  const [isSelecting, setIsSelecting] = useState(false); // Whether in selection mode
  const [view, setView] = useState<"selection" | "submitted">("selection"); // Current view mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //Selection, ranking and comments state, indexed by applicationId
  const [selectedApplicants, setSelectedApplicants] = useState<{[id:number] : boolean}>({}); //stores selection status by applicationID
  const [rankedApplicants, setRankedApplicants] = useState<{[id:number] : number}>({}) //stores rank by applicationID
  const [comments, setComments] = useState<{[id:number] : string}>({}) //stores comments by applicationID
  const [courseSelections, setCourseSelections] = useState<{[id:number] : number[]}>({}); //stores selected course IDs by applicationID
  const [submittedData, setSubmittedData] = useState<DisplayApplicant[]>([]); //stores all the data of submitted applicants
  
  /* Helper function to format academic credentials */
  const formatAcadCred = (credentials : {qualification: string; institution: string; year: number}[]) => {
    return credentials.map((cred)=> `${cred.qualification} from ${cred.institution} (${cred.year})`).join(", ");
  }
  
  /* Helper function to format courses */
  const formatCourseforDisplay = (courses : {courseCode: string; courseName: string}[]) => {
    return courses.map((c)=> `${c.courseCode} ${c.courseName}`);
  }

  /**
   * Fetch applicant data from backend and format for frontend.
   * function memoized with useCallback to prevent unecessary re-creations.
   */
  
  const fetchApplicants = useCallback(async() => {
      try{
        
        const applications = await tutorApi.getAllApplications(); //fetches all applications

        const formattedApplications : DisplayApplicant[] =applications.map((app: Tutor) => {
          const name = app.user ? `${app.user.firstName} ${app.user.lastName}` : "N/A";
          const academicCred = app.user ? formatAcadCred(app.academicCredentials) : "No Academic Credentials";

          return{
            ...app,
            name,
            academicCred,
            formattedCourses : formatCourseforDisplay(app.courses),
          };
        });

        setApplicants(formattedApplications);

        //initialize/restore selection, rank and comments from fetched data
        const initialSelected : {[id:number] : boolean} = {};
        const initialRanks : {[id:number] : number} = {};
        const initialComments : {[id: number] : string} = {};
        const initialCoursesSelected : {[id: number] : number[]} = {};
        
        formattedApplications.forEach(app => {
          if(app.isSelected){
            initialSelected[app.applicationId] = true;

            if(app.rank!== undefined && app.rank!==null){
              initialRanks[app.applicationId] = app.rank;
            }

            if(app.comments){
              initialComments[app.applicationId] = app.comments;
            }

            if(app.selectedCourses && app.selectedCourses.length>0){
              initialCoursesSelected[app.applicationId] = app.selectedCourses.map(c => c.courseID);
            }
          }
        });

        setSelectedApplicants(initialSelected);
        setRankedApplicants(initialRanks);
        setComments(initialComments);
        setCourseSelections(initialCoursesSelected);

      }catch(error){
        console.error("Failed to fetch applications : ", error);
        setError("Failed to load applicants. Please try again");

        toast ({
          title: "Error",
          description: "Failed to load applicants",
          status: "error",
          duration : 5000,
          isClosable : true,
        })
      } finally{
        setLoading(false);
      }
    } , [toast]);

//load applicant data on component mount
  useEffect (()=> {
    fetchApplicants();
  },[fetchApplicants]);
  
  /**
   * Handles changes to filter input fields
   * Validates input and updates filter state
   */
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isValid = /^[A-Za-z\s]*$/.test(value); // Regex to allow only letters and spaces

    // Validate filter inputs to prevent injection or invalid searches
    if (name === "name" || name === "course" || name === "availability" || name === "skill") {
      if (!isValid) {
        setInputErrors((prev) => ({
          ...prev,
          name: "Only letters and spaces are allowed.",
        }));
        return;
      } else {
        // Clear error if input is now valid
        setInputErrors((prev) => {
          const updated = { ...prev };
          delete updated.name;
          return updated;
        });
      }
    }

    // Update filter state with new value
    setFilter({
        ...filter, [e.target.name]: e.target.value
    });
 };

  /**
   * Applies current filters to the applicant list
   * Filters by name, course, availability, and skills
   * Case-insensitive partial matching for all fields
   */
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesCourse = !filter.course || applicant.formattedCourses.some((course) => course.toLowerCase().includes(filter.course.toLowerCase()));
    const matchesName = !filter.name || applicant.name.toLowerCase().includes(filter.name.toLowerCase());
    const matchesAvailability = !filter.availability || applicant.availability.toLowerCase().includes(filter.availability.toLowerCase());
    const matchesSkill = !filter.skill || applicant.skills.some((skill)=>skill.skillName.toLowerCase().includes(filter.skill.toLowerCase()));

    // An applicant must match ALL active filters
    return (
     matchesCourse && 
     matchesName && 
     matchesAvailability && 
     matchesSkill
    );
  });

  /**
   * Sorts the filtered applicants based on selected sort criteria
   * Currently supports sorting by course name or availability
   */
  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    if (sortedBy === "course") {
      // Sort by first course name alpahbetically from formatted courses
      const aCourseName = a.formattedCourses[0] || "";
      const bCourseName = b.formattedCourses[0] || "";
      return aCourseName.localeCompare(bCourseName);
    } else if (sortedBy === "availability") {
      // For availability sorting, we do secondary sort by name
      const availabilityComparison = a.availability.localeCompare(b.availability);

      if(availabilityComparison!==0){
        return availabilityComparison;
      }
      return a.name.localeCompare(b.name);
    }
    return 0; // No sorting
  });
  
  /**
   * Toggles selection state for an applicant
   */
  const handleSelectApplicant = (applicantId: number) => {
    setSelectedApplicants((prev)=>({
      ...prev,
      [applicantId] : !prev[applicantId],
    }))
  };
  
  /**
   * Assigns a rank to an applicant and updates the ranked applicants list
   * Ensures rank is not negative
   */
  const handleRankApplicant = (applicantId: number, rank: number) => {
    const validRank = Math.max(0,rank); // Ensure rank is not negative
    setRankedApplicants((prev) => ({
        ...prev,
        [applicantId] : validRank,
    }));

    setRankErrors((prev) => {
      const updated = {...prev};
      delete updated[applicantId];
      return updated;
    })
  };

  /**
   * Updates comments for a specific applicant
   */
  const handleCommentChange = (applicantId: number, comment: string) => {
    setComments({
      ...comments,
      [applicantId]: comment,
    });
  };

  /**
   * Toggles course selection for an applicant
   * Either adds or removes a course from the selected courses list
   */
  const handleCourseToggle = (applicantId: number, courseID:number) =>{
    setCourseSelections((prev)=>{
      const selectedCourses = prev[applicantId] || [];
      const updatedCourses = selectedCourses.includes(courseID)
        ? selectedCourses.filter((id)=> id!==courseID) // Remove course if already selected
        : [...selectedCourses, courseID]; // Add course if not selected

      return {
        ...prev,
        [applicantId]:updatedCourses
      }
    });
  };

  /**
   * Handles final submission of selected applicants
   * Validates ranks and sends updates to backend
   */
const handleSubmit = async () => {

  const newRankErrors: {[key: number] : string} = {}; //use number for keys
  const applicantsToSubmit = applicants.filter(applicant => selectedApplicants[applicant.applicationId]);

    if(applicantsToSubmit.length === 0){
      toast({
        title: "No Applicant Selected",
        description: "Please select at least one applicant before submitting",
        status: "error",
        duration: 5000,
        isClosable: true
      });
      return;
    }

    //Now, iterate directly over applicants to submit
    applicantsToSubmit.forEach((app) => {
      const selectedCourses = courseSelections[app.applicationId] || [];
      if(selectedCourses.length === 0){ 
          newRankErrors[app.applicationId] = "Please select atleast one course for this applicant";
      }
    })
    
     //check for duplicate ranks
    const  ranksInUse: {[rank:number] : number[]} = {};
    applicantsToSubmit.forEach((app) => {
      const rank = rankedApplicants[app.applicationId];

      if(rank!==undefined && rank!==null){
        if(ranksInUse[rank]){
          ranksInUse[rank].push(app.applicationId);
        }else{
          ranksInUse[rank] = [app.applicationId]
        }
      }
    });

   
    for(const rank in ranksInUse){
      if(ranksInUse[rank].length>1){
        ranksInUse[rank].forEach((id) => {
          newRankErrors[id] = `Rank ${rank} is already assigned to another applicant. Please chooose a unique rank.`;
        });
      }
    }

    if(Object.keys(newRankErrors).length>0){
      setRankErrors(newRankErrors);
      toast({
        title: "Validation Error",
        description: "Please resolve all validation errors before submitting",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    } else{
      setRankErrors({});
    }

    try{
      setLoading(true);
      const updatedApplications = applicantsToSubmit.map(async(app) => {
        const updateDetails = {
          rank: rankedApplicants[app.applicationId] ?? null,
          comments: comments[app.applicationId] ?? null,
          selectedCourseIDs : courseSelections[app.applicationId] ?? [],
          status: "approved" as "approved" | "rejected",
          isSelected: true,
        };

        //call backend API to update the application
        await tutorApi.updateApplicationByLecturer(app.applicationId, updateDetails);

        //Return full applicant object with updated fields for local state
        return{
          ...app,
          ...updateDetails,
          selectedCourses: app.courses.filter(course => updateDetails.selectedCourseIDs.includes(course.courseID)),
        };
      });

      const successfulUpdation = await Promise.all(updatedApplications);
      
      //set submitted data and switch to 'submitted' view
      setSubmittedData(successfulUpdation);
      setView("submitted");

      toast({
        title: "Submitted",
        description: "Applications submitted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }catch(submitError){
      console.error("Failed to submit applications: ", submitError);
      toast({
        title: "Submission Error",
        description: "Failed to submit applications. Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }finally{
      setLoading(false);
    }
  // // Get previously submitted data from local storage
  // const existingDataString = localStorage.getItem("selectedApplicants");
  // const existingData: Applicant[] = existingDataString ? JSON.parse(existingDataString) : [];

  // // Prepare new selected data with all details (courses, ranks, comments)
  // const selectedData = selectedApplicants.map((applicant) => ({
  //   ...applicant,
  //   selectedCourses: courseSelections[applicant.name] || [],
  //   rank: rankedApplicants.find((r) => r.name === applicant.name)?.rank,
  //   comments: comments[applicant.name],
  // }));

  // // Create an object to track ranks and detect duplicates
  // const rankTracker: { [key: string]: boolean } = {}; // Tracks whether a rank is already assigned
  // const newRankErrors: { [key: string]: string } = {}; // Temporary object to store errors

  // // Check if any rank is duplicated only when rank is filled
  // selectedData.forEach((applicant) => {
  //   const rank = applicant.rank;
  //   if (rank) {
  //     if (rankTracker[rank]) {
  //       // If rank is already assigned, add error for this rank
  //       newRankErrors[applicant.name] = `Rank ${rank} is already assigned to another applicant. Please choose a unique rank.`;
  //     } else {
  //       rankTracker[rank] = true;
  //     }
  //   }
  // });

  // // If there are errors, prevent submission
  // if (Object.keys(newRankErrors).length > 0) {
  //   setRankErrors(newRankErrors); // Set error messages
  //   return; // Stop submission
  // }

  // // Merge & de-duplicate by name (update existing data)
  // const mergedData = selectedData.reduce((acc, newApplicant) => {
  //   const existingIndex = acc.findIndex((existing) => existing.name === newApplicant.name);
  //   if (existingIndex > -1) {
  //     // Update the existing applicant's data
  //     acc[existingIndex] = { ...acc[existingIndex], ...newApplicant };
  //   } else {
  //     // Add the new applicant
  //     acc.push(newApplicant);
  //   }
  //   return acc;
  // }, existingData);

  // // Save merged data to local storage
  // localStorage.setItem("selectedApplicants", JSON.stringify(mergedData));

  // // Save submitted data to state and switch to submitted view
  // setSubmittedData(mergedData);
  // setView("submitted");
};

  return (
    <>
      <Header />
      {/* Main container with animation effects */}
      <MotionBox
        p={10}
        minH="100vh"
        pt="80px"
        bgGradient="linear(to-r, #0E4C92, #002147)" // Blue gradient background
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        >
        {/* Conditional rendering based on current view */}
        {view === "selection" ? (
          <>
            <Text fontSize="4xl" fontWeight={"bold"} mb={6} color="white">
              Lecturer Dashboard
            </Text>
  
            {/* Filters Section */}
            <Box bg="white" p={6} rounded="2xl" boxShadow="lg" mb={6}>
            <HStack spacing={4} mb={4}>
              
              {/* Filter by tutor name */}
              <Input 
                name="name" 
                color = "blue.700" 
                placeholder="Search by Tutor Name" 
                value={filter.name}
                onChange={handleFilterChange} 
                _hover={{
                  borderColor: "blue.500",
                  outline: "1px blue",
                }}
              />
              
              {/* Filter by course name */}
              <Input 
                name="course" 
                color = "blue.700" 
                placeholder="Search by Course Name" 
                value={filter.course}
                onChange={handleFilterChange} 
                _hover={{
                  borderColor: "blue.500",
                  outline: "1px blue",
                }}
              />

              {/* Filter by availability */}
              <Input 
                name="availability" 
                color = "blue.700" 
                placeholder="Search by Availability" 
                value={filter.availability}
                onChange={handleFilterChange} 
                _hover={{
                  borderColor: "blue.500",
                  outline: "1px blue",
                }}
              />

              {/* Filter by skills */}
              <Input 
                name="skill" 
                color = "blue.700" 
                placeholder="Search by Skills" 
                value={filter.skill}
                onChange={handleFilterChange} 
                _hover={{
                  borderColor: "blue.500",
                  outline: "1px blue",
                }}
              />
            </HStack>
            
            {/* Sort options dropdown */}
            <Select
                placeholder="Sort by"
                onChange={(e) =>
                  setSortedBy(e.target.value === "none" ? null : e.target.value)
                }
                _hover={{
                  borderColor: "blue.500",
                  outline: "1px blue",
                }}
                >
                <option value="none">None</option>
                <option value="course">Sort by Course (A–Z)</option>
                <option value="availability">Sort by Availability (A–Z)</option>
              </Select>
              
              {/* Display input validation errors */}
              {inputErrors.name && (
                <Text color="red.500" fontSize="sm">
                  {inputErrors.name}
                </Text>
              )}

              {error && (
                <Text color="red.800" fontWeight="semibold">
                  {error}
                </Text>
            )}

            </Box>

            {/* Select Mode Toggle */}
            <HStack justify="space-between" mb={4}>
            <Button 
              onClick={() => setIsSelecting((prev) => !prev)} 
              mb={4} colorScheme="blue"
              sx={{
                cursor: "pointer",
              }}>
              {isSelecting ? "Done Selecting" : "Select Applicants"}
            </Button>

            {/* Only show Submit button when in selection mode and at least one applicant is selected */}
            {isSelecting && 
            Object.values(selectedApplicants).some((isSelected)=> isSelected) &&(
              <Button 
                onClick={handleSubmit} 
                colorScheme = "green"
                isLoading = {loading}
                sx={{
                  cursor: "pointer",
                }}
              >
                Submit Selected
              </Button>
            )}
            </HStack>

            
            
            {/* Applicants Table */}
            <Box overflowX="auto" bg="white" p={4} boxShadow="md" rounded="xl" maxWidth="100%">
            <TableContainer borderRadius="xl" overflow="visible" minW="1200px">
            <Table variant="striped" colorScheme="gray">
              <Thead bg="blue.100">
                <Tr>
                  {isSelecting && <Th textAlign="center">Select</Th>}
                  {isSelecting && <Th textAlign="center">Select Courses</Th>}
                  <Th textAlign="center">Name</Th>
                  <Th textAlign="center">Role</Th>
                  <Th textAlign="center">Academic Credentials</Th>
                  <Th textAlign="center" width="400px">Courses</Th>
                  <Th textAlign="center">Skills</Th>
                  <Th textAlign="center">Availability</Th>
                  {isSelecting && <Th textAlign="center">Rank</Th>}
                  {isSelecting && <Th textAlign="center">Comments</Th>}
                  <Th textAlign="center">Previous Roles</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Map through filtered & sorted applicants to create table rows */}
                {sortedApplicants.map((applicant) => (
                  <Tr key={applicant.applicationId}>
                    {/* Selection checkbox - only shown in selection mode */}
                    {isSelecting && (
                      <Td textAlign="center">
                        <Checkbox
                          onChange={() => handleSelectApplicant(applicant.applicationId)}
                          isChecked={!!selectedApplicants[applicant.applicationId]}
                        />
                      </Td>
                    )}
                    
                    {/* Course selection checkboxes - only shown in selection mode */}
                    {isSelecting && (
                      <Td textAlign="center">
                      <VStack align="start">
                        {applicant.courses.map((course, idx) => (
                          <Checkbox
                            key={idx}
                            isChecked={courseSelections[applicant.applicationId]?.includes(course.courseID)}
                            onChange={() => handleCourseToggle(applicant.applicationId, course.courseID)}
                          >
                            {`${course.courseCode} ${course.courseName}`}
                          </Checkbox>
                        ))}
                      </VStack>
                      {rankErrors[applicant.applicationId] && rankErrors[applicant.applicationId].includes("course") && (
                        <div className="error-message" style={{ color: 'red' }} >{rankErrors[applicant.applicationId]}</div>
                      )}
                    </Td>
                    )}
                    
                    {/* Basic applicant information */}
                    <Td textAlign="center" fontWeight="semibold">{applicant.name}</Td>
                    <Td textAlign="center">{capitalizeWords(applicant.sessionType)}</Td>
                    <Td textAlign="center">{applicant.academicCred}</Td>
                    
                    {/* Course list with styled boxes */}
                    <Td>
                      <VStack wrap="wrap">
                      {applicant.formattedCourses.map((course, index)=>(
                        <Box key = {index} 
                        px={2}
                        py={1}
                        borderRadius="xl"
                        rounded = "xl"
                        fontSize="sm"
                        color="blue.800"
                        width="fit-content"
                        >
                          {course}
                      </Box>
                      ))}
                    </VStack>
                    </Td>
                    
                    <Td textAlign="center">{capitalizeWords(applicant.skills.join(", "))}</Td>
                    <Td textAlign="center">{capitalizeWords(applicant.availability)}</Td>
                    
                    {/* Ranking and comments - only shown in selection mode */}
                    {isSelecting && (
                      <>
                        <Td textAlign="center">
                          <Input
                            type="number"
                            size="sm"
                            p={4}
                            m={4}
                            placeholder="Rank"
                            value = {rankedApplicants[applicant.applicationId]|| ""}
                            onChange={(e) => handleRankApplicant(applicant.applicationId, Number(e.target.value))}
                          />
                          {/* Display rank validation errors */}
                          {rankErrors[applicant.applicationId] &&  !rankErrors[applicant.applicationId].includes("course") && (
                          <div className="error-message" style={{ color: 'red' }} >{rankErrors[applicant.applicationId]}</div>
                          )}
                        </Td>
                        <Td textAlign="center">
                          <Textarea
                            size="sm"
                            placeholder="Comments"
                            value={comments[applicant.applicationId] || ""}
                            onChange={(e) => handleCommentChange(applicant.applicationId, e.target.value)}
                          />
                        </Td>
                      </>
                    )}
                    
                    <Td textAlign="center">{applicant.previousRoles?.map(role => capitalizeWords(role)).join(", ") || "No previous roles"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            </TableContainer>
            </Box>
            
          </>
        ) : (
          <>
            {/* Submitted Data View */}
            <Text fontSize="2xl" fontWeight="bold" mt={6} color="white">
              Submitted Applicants
            </Text>
            <Box 
              overflowX="auto" 
              bg="white" 
              p={4} 
              boxShadow="md" 
              rounded="xl"
              position="relative"
              w="100%"
              maxWidth="100%">
            <TableContainer borderRadius="xl" overflow="visible" minW="1200px">
            <Table variant="striped" colorScheme="gray">
              <Thead bg="blue.100">
                <Tr>
                  <Th textAlign="center">Name</Th>
                  <Th textAlign="center">Rank</Th>
                  <Th textAlign="center">Comments</Th>
                  <Th textAlign="center">Selected Courses</Th>
                  <Th textAlign="center">Role</Th>
                  <Th textAlign="center">Academic Credentials</Th>
                  <Th textAlign="center">Courses</Th>
                  <Th textAlign="center">Skills</Th>
                  <Th textAlign="center">Availability</Th>
                  <Th textAlign="center">Previous Roles</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Map through submitted applicants */}
                {submittedData.map((applicant) => (
                  <Tr key={applicant.applicationId}>
                    <Td textAlign="center">{applicant.name}</Td>
                    <Td textAlign="center">{applicant.rank || "N/A"}</Td>
                    <Td textAlign="center">{applicant.comments || "No comments"}</Td>
                    <Td>
                      <VStack wrap="wrap">
                        {applicant.selectedCourses?.length ? (
                          applicant.selectedCourses.map((course, index) => (
                            <Box
                              key={index}
                              px={2}
                              py={1}
                              borderRadius="xl"
                              rounded="xl"
                              fontSize="sm"
                              color="blue.800"
                              width="fit-content"
                            >
                               {`${course.courseCode} ${course.courseName}`}
                            </Box>
                          ))
                        ) : (
                          <Box
                            px={2}
                            py={1}
                            borderRadius="xl"
                            rounded="xl"
                            fontSize="sm"
                            color="gray.600"
                            width="fit-content"
                          >
                            All courses
                          </Box>
                        )}
                      </VStack>
                    </Td>
                    <Td textAlign="center">{capitalizeWords(applicant.sessionType)}</Td>
                    <Td textAlign="center">{applicant.academicCred}</Td>
                    <Td textAlign="center">
                    <VStack wrap="wrap">
                      {applicant.formattedCourses.map((course, index)=>(
                        <Box key = {index} 
                        px={2}
                        py={1}
                        borderRadius="xl"
                        rounded = "xl"
                        fontSize="sm"
                        color="blue.800"
                        width="fit-content"
                        >
                          {course}
                      </Box>
                      ))}
                    </VStack>
                    </Td>
                    <Td textAlign="center">{capitalizeWords(applicant.skills.join(", "))}</Td>
                    <Td textAlign="center">{capitalizeWords(applicant.availability)}</Td>
                    <Td textAlign="center">{applicant.previousRoles?.map(role => capitalizeWords(role)).join(", ") || "No previous roles"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            </TableContainer>
            </Box>
            
            {/* Button to return to selection view */}
            <Button 
              mt={6} 
              onClick={() => setView("selection")} 
              colorScheme="blue" 
              sx={{
                cursor: "pointer",
              }}>
              Back To Selection
            </Button>
          </>
        )}
        
      </MotionBox>
      <Footer />
    </>
  );
};

export default LecturerDashboard;