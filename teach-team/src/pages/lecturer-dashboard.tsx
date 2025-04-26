import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "@chakra-ui/react";

/**
 * Interface representing an applicant for tutor positions
 * Contains all details about the applicant including personal info, qualifications,
 * and application status
 */
interface Applicant {
  name: string;               // Applicant's full name
  courses: string[];          // List of courses they can teach
  skills: string[];           // Technical/teaching skills
  availability: string;       // When they're available to teach
  timestamp: string;          // When application was submitted
  rank?: number;              // Optional ranking assigned by lecturer
  role: string[];             // Roles they can fulfill (e.g., tutor, demonstrator)
  academicCred: string;       // Academic credentials/qualifications
  comments?: string;          // Optional comments added by lecturer
  previousRoles: string[];    // Past teaching experience
  selectedCourses?: string[]; // Courses specifically selected for this applicant
}

// Create a motion-enabled Box component using Framer Motion for animations
const MotionBox = motion(Box);

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
  // Main state management
  const [applicants, setApplicants] = useState<Applicant[]>([]); // All applicants in the system
  const [selectedApplicants, setSelectedApplicants] = useState<Applicant[]>([]); // Applicants chosen by lecturer
  const [rankedApplicants, setRankedApplicants] = useState<Applicant[]>([]); // Applicants with rankings assigned
  const [comments, setComments] = useState<{ [name: string]: string }>({}); // Comments indexed by applicant name
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
  const [submittedData, setSubmittedData] = useState<Applicant[]>([]); // Final submitted selections
  const [view, setView] = useState<"selection" | "submitted">("selection"); // Current view mode
  const [courseSelections, setCourseSelections] = useState<{[name:string]:string[]}>({}); // Specific courses selected for each applicant
  
  /**
   * Extracts and formats a name from a localStorage key
   * Converts format like "john_smith_applicationData" to "John Smith"
   */
  const extractNameFromKey = (key: string) => {
    const name = key.replace("_applicationData","");
    const formattedName = name
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return formattedName;
  };

  /**
   * Load applicant data from localStorage on component mount
   * Finds all entries with "_applicationData" suffix and parses them
   */
  useEffect(() => {
    const storedApplicants: Applicant[] = Object.keys(localStorage)
      .filter((key) => key.endsWith("_applicationData"))
      .map((key) => {
        const item = localStorage.getItem(key);
        const name = extractNameFromKey(key);

        if (item) {
          try {
            const applicantData = JSON.parse(item) as Applicant;
            return {
              ...applicantData,
              name: name,
              courses: applicantData.courses?.map((c: any)=> `${c.id} - ${c.name}`) || [],
              };
          } catch (error) {
            console.error(`Error parsing applicant data for ${key}: `, error);
            return null;
          }
        }
        return null;
      })
      .filter((applicant): applicant is Applicant => applicant !== null); // Type predicate to filter out null values

    setApplicants(storedApplicants);
  }, []); // Empty dependency array ensures this runs only once on mount

  /**
   * Restore previously saved selections when returning to selection view
   * Loads selected applicants, rankings, comments, and course selections
   */
  useEffect (() => {
    if(view === "selection"){
      // Load previously selected applicants
      const existingDataString = localStorage.getItem("selectedApplicants");
      const existingData : Applicant[] = existingDataString ? JSON.parse(existingDataString) : [];

      // Restore selected state for checkboxes
      setSelectedApplicants(existingData);

      // Restore previously assigned rankings
      const restoreRanks : Applicant[]  = existingData
      .filter((a)=>a.rank !==undefined)
      .map((a)=>({...a}));
      setRankedApplicants(restoreRanks);

      // Restore previously entered comments
      const restoreComments: {[name:string]:string} = {};
      existingData.forEach((a)=>{
        if(a.comments){
          restoreComments[a.name]=a.comments;
        }
      });
      setComments(restoreComments);

      // Restore previously selected courses
      const restoreCourseSelections : {[name:string]:string[]} = {};
      existingData.forEach((a)=>{
        if(a.selectedCourses){
          restoreCourseSelections[a.name] = a.selectedCourses;
        }
      });
      setCourseSelections(restoreCourseSelections);
    }
  },[view]); // Runs when view changes between "selection" and "submitted"

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
    const matchesCourse = !filter.course || applicant.courses.some((course) => course.toLowerCase().includes(filter.course.toLowerCase()));
    const matchesName = !filter.name || applicant.name.toLowerCase().includes(filter.name.toLowerCase());
    const matchesAvailability = !filter.availability || applicant.availability.toLowerCase().includes(filter.availability.toLowerCase());
    const matchesSkill = !filter.skill || applicant.skills.some((course)=>course.toLowerCase().includes(filter.skill.toLowerCase()));

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
      // Extract course name from format "ID - Name" and sort alphabetically
      const aCourseName = a.courses[0]?.split(" - ")[1] || "";
      const bCourseName = b.courses[0]?.split(" - ")[1] || "";
      return aCourseName.localeCompare(bCourseName);
    } else if (sortedBy === "availability") {
      // For availability sorting, we do secondary sort by name
      return a.name.localeCompare(b.name);
    }
    return 0; // No sorting
  });
  
  /**
   * Toggles selection state for an applicant
   * Updates localStorage to persist selections
   */
  const handleSelectApplicant = (applicant: Applicant) => {
    setSelectedApplicants((prev) => {
      const isSelected = prev.some((a) => a.name === applicant.name);
  
      if (isSelected) {
        // Deselecting the applicant
        const updatedSelectedApplicants = prev.filter((a) => a.name !== applicant.name);
        
        // Update localStorage to reflect deselection
        localStorage.setItem("selectedApplicants", JSON.stringify(updatedSelectedApplicants));
  
        return updatedSelectedApplicants;
      } else {
        // Selecting the applicant
        const updatedSelectedApplicants = [...prev, applicant];
  
        // Update localStorage to reflect selection
        localStorage.setItem("selectedApplicants", JSON.stringify(updatedSelectedApplicants));
  
        return updatedSelectedApplicants;
      }
    });
  };
  
  /**
   * Assigns a rank to an applicant and updates the ranked applicants list
   * Ensures rank is not negative and sorts the list by rank
   */
  const handleRankApplicant = (applicant: Applicant, rank: number) => {
    const validRank = Math.max(0,rank); // Ensure rank is not negative
    setRankedApplicants((prev) => {
      // Remove any existing rank for this applicant
      const updated = prev.filter((a) => a.name !== applicant.name);
      // Add applicant with new rank and sort the list
      return [
        ...updated,
        { ...applicant, rank: validRank },
      ].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)); // Sort by rank (ascending)
    });
  };

  /**
   * Updates comments for a specific applicant
   */
  const handleCommentChange = (name: string, comment: string) => {
    setComments({
      ...comments,
      [name]: comment,
    });
  };

  /**
   * Toggles course selection for an applicant
   * Either adds or removes a course from the selected courses list
   */
  const handleCourseToggle = (applicantName: string, course:string) =>{
    setCourseSelections((prev)=>{
      const selectedCourses = prev[applicantName] || [];
      const updatedCourses = selectedCourses.includes(course)
        ? selectedCourses.filter((c)=> c!==course) // Remove course if already selected
        : [...selectedCourses, course]; // Add course if not selected

      return {
        ...prev,
        [applicantName]:updatedCourses
      }
    });
  };

  /**
   * Handles final submission of selected applicants
   * Validates ranks, merges with existing data, and saves to localStorage
   */
const handleSubmit = () => {
  // Get previously submitted data from local storage
  const existingDataString = localStorage.getItem("selectedApplicants");
  const existingData: Applicant[] = existingDataString ? JSON.parse(existingDataString) : [];

  // Prepare new selected data with all details (courses, ranks, comments)
  const selectedData = selectedApplicants.map((applicant) => ({
    ...applicant,
    selectedCourses: courseSelections[applicant.name] || [],
    rank: rankedApplicants.find((r) => r.name === applicant.name)?.rank,
    comments: comments[applicant.name],
  }));

  // Create an object to track ranks and detect duplicates
  const rankTracker: { [key: string]: boolean } = {}; // Tracks whether a rank is already assigned
  const newRankErrors: { [key: string]: string } = {}; // Temporary object to store errors

  // Check if any rank is duplicated only when rank is filled
  selectedData.forEach((applicant) => {
    const rank = applicant.rank;
    if (rank) {
      if (rankTracker[rank]) {
        // If rank is already assigned, add error for this rank
        newRankErrors[applicant.name] = `Rank ${rank} is already assigned to another applicant. Please choose a unique rank.`;
      } else {
        rankTracker[rank] = true;
      }
    }
  });

  // If there are errors, prevent submission
  if (Object.keys(newRankErrors).length > 0) {
    setRankErrors(newRankErrors); // Set error messages
    return; // Stop submission
  }

  // Merge & de-duplicate by name (update existing data)
  const mergedData = selectedData.reduce((acc, newApplicant) => {
    const existingIndex = acc.findIndex((existing) => existing.name === newApplicant.name);
    if (existingIndex > -1) {
      // Update the existing applicant's data
      acc[existingIndex] = { ...acc[existingIndex], ...newApplicant };
    } else {
      // Add the new applicant
      acc.push(newApplicant);
    }
    return acc;
  }, existingData);

  // Save merged data to local storage
  localStorage.setItem("selectedApplicants", JSON.stringify(mergedData));

  // Save submitted data to state and switch to submitted view
  setSubmittedData(mergedData);
  setView("submitted");
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
                value={filter.course
                }
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
            {isSelecting && selectedApplicants.length>0 && (
              <Button 
                onClick={handleSubmit} 
                colorScheme = "green"
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
                  <Tr key={applicant.timestamp}>
                    {/* Selection checkbox - only shown in selection mode */}
                    {isSelecting && (
                      <Td textAlign="center">
                        <Checkbox
                          onChange={() => handleSelectApplicant(applicant)}
                          isChecked={selectedApplicants.some((a)=>a.name === applicant.name)}
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
                            isChecked={courseSelections[applicant.name]?.includes(course)}
                            onChange={() => handleCourseToggle(applicant.name, course)}
                          >
                            {course}
                          </Checkbox>
                        ))}
                      </VStack>
                    </Td>
                    )}
                    
                    {/* Basic applicant information */}
                    <Td textAlign="center" fontWeight="semibold">{applicant.name}</Td>
                    <Td textAlign="center">{applicant.role.join(", ")}</Td>
                    <Td textAlign="center">{applicant.academicCred}</Td>
                    
                    {/* Course list with styled boxes */}
                    <Td>
                      <VStack wrap="wrap">
                      {applicant.courses.map((course, index)=>(
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
                    
                    <Td textAlign="center">{applicant.skills.join(", ")}</Td>
                    <Td textAlign="center">{applicant.availability}</Td>
                    
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
                            value = {rankedApplicants.find((r)=>r.name === applicant.name)?.rank || ""}
                            onChange={(e) => handleRankApplicant(applicant, Number(e.target.value))}
                          />
                          {/* Display rank validation errors */}
                          {rankErrors[applicant.name] && (
                          <div className="error-message" style={{ color: 'red' }} >{rankErrors[applicant.name]}</div>
                          )}
                        </Td>
                        <Td textAlign="center">
                          <Textarea
                            size="sm"
                            placeholder="Comments"
                            value={comments[applicant.name] || ""}
                            onChange={(e) => handleCommentChange(applicant.name, e.target.value)}
                          />
                        </Td>
                      </>
                    )}
                    
                    <Td textAlign="center">{applicant.previousRoles?.join(", ") || "No previous roles"}</Td>
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
                  <Tr key={applicant.timestamp}>
                    <Td textAlign="center">{applicant.name}</Td>
                    <Td textAlign="center">{applicant.rank}</Td>
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
                              {course}
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
                    <Td textAlign="center">{applicant.role.join(", ")}</Td>
                    <Td textAlign="center">{applicant.academicCred}</Td>
                    <Td textAlign="center">
                    <VStack wrap="wrap">
                      {applicant.courses.map((course, index)=>(
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
                    <Td textAlign="center">{applicant.skills.join(", ")}</Td>
                    <Td textAlign="center">{applicant.availability}</Td>
                    <Td textAlign="center">{applicant.previousRoles?.join(", ") || "No previous roles"}</Td>
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