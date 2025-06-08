import { useState, useEffect, useCallback, useRef } from "react";
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
  Accordion,
  AccordionIcon,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@chakra-ui/react";

import {tutorApi, Tutor} from "../services/api";

/**
 * Extended applicant interface to combine tutor details for frontend display.
 */
interface DisplayApplicant extends Tutor{
  name: string;
  formattedCourses : string[];
  academicCred : string;
}

// Create a motion-enabled Box component using Framer Motion for animations
const MotionBox = motion(Box);

//capializes the first letter of each word in a string
const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * LecturerDashboard Component
 * 
 * This dashboard allows lecturers to:
 * - View all tutor applicants
 * - Search, Filter and sort applicants
 * - Select applicants for courses
 * - Rank applicants by preference
 * - Add comments to applications
 * - Submit final selections
 */
const LecturerDashboard = () => {
  //hook for displaying toast notifications
  const toast = useToast();

  // Main state management
  const [applicants, setApplicants] = useState<DisplayApplicant[]>([]); // All applicants in the system
  const [filteredApplicants, setFilteredApplicants] = useState<DisplayApplicant[]>([]);//Stores applicants after applying filters
 const [rankErrors, setRankErrors] = useState<{ [key: string]: string }>({}); // Error messages for invalid rankings
  const [inputErrors, setInputErrors] = useState<{ name?: string }>({}); // Validation errors for input fields
  
  // 
  // Filter and sort state
  const [filter, setFilter] = useState({
    generalSearch: "", //general search term accross multiple fields
    //For checkbox filters:
    sessionType: [] as string[],
    candidateName: [] as string[],
    availability: [] as string[],
    skills: [] as string[],
  });
  const [sortedBy, setSortedBy] = useState<string | null>(null); // Current sort parameter
  
  // UI state controls
  const [isSelecting, setIsSelecting] = useState(false); // Whether in selection mode
  const [view, setView] = useState<"selection" | "submitted">("selection"); // Current view mode
  const [loading, setLoading] = useState(false);//if data is currently loading or submitted
  const [error, setError] = useState<string | null>(null);//error messages for fetching data

// Ref for the debounce timeout, to delay filter application
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  
  const fetchAllApplications = useCallback(async() => {
      try{
        setLoading(true); //set Loading state to true
        const applications = await tutorApi.getAllApplications(); //call API to get all applications
        
        //format fetched applications 
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
        //initially, filtered applicants are set to all applicants 
        setFilteredApplicants(formattedApplications);

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

    /** 
     * Applies filters based on current filter state by c alling backedn API
     * Memoized wiht useCallback to prevent unnecessary recreations 
     */
  const applyFilters = useCallback(async()=>{
    try{
      setLoading(true);
      //Define parameters for the API call
      const params:{
          candidateName ?: string;
          sessionType ?: string;
          availability ?: string;
          skills ?: string;
          generalSearch?:string;
        } = {};

        //Map general search to all relavant backend filter fields
        if(filter.generalSearch && filter.generalSearch.trim()){
         params.generalSearch = filter.generalSearch.trim();
        }

        //Specific checkbox filters if selected
        if(filter.candidateName.length>0){
          params.candidateName = filter.candidateName.join(",");
        }
        if(filter.sessionType.length>0){
          params.sessionType = filter.sessionType.join(",");
        }
        if(filter.availability.length>0){
          params.availability = filter.availability.join(",");
        }
        if(filter.skills.length>0){
          params.skills = filter.skills.join(",");
        }

        //call API with filter parameters
        const applications = await tutorApi.getFilteredApplications(params);

        //Format filtered applications
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

        setFilteredApplicants(formattedApplications);
    }catch(error){
      console.error("Failed to apply filters", error);
      toast({
        title: "Fitler Error",
        description: "Failed to apply filters",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }finally{
      setLoading(false);
    }
  },[filter, toast])

/**
 * Debounce function to apply filters
 * Ensures the applyFilter API call is not made too frequently while typing in search bar
 * When a user is typing in the search bar, each key release triggers the debounce again.
 * Every invocation first resets/clears the previous timer, and sets a new timer (200ms here) 
 * for the function call. 
 * Basically, this goes on as long as the user keeps hitting the keys under 200ms 
 *  - and when finally the user pauses typing form ore than 200ms, the applyFilters function is called. 
 * */ 
const debouncedApplyFilters = useCallback(() => {
    if (searchTimeoutRef.current) {
      //Clear previous timeout if exists
        clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
        applyFilters(); //call applyFilters after 
    }, 200); // 200ms debounce time(delay)
}, [applyFilters]);

/** Clears all filters and re-fetches all applications */
const clearFilters = useCallback(()=>{
  //Reset filter state to initial empty values
  setFilter({
    generalSearch: "",
    sessionType: [],
    candidateName: [],
    availability: [],
    skills: []
  });
  fetchAllApplications();//Re-fetch all applications
  setInputErrors({});//clear any input errors
},[fetchAllApplications]);

//load applicant data on component mount
  useEffect (()=> {
    fetchAllApplications();
  },[fetchAllApplications]);
  
  /**
   * Handles changes to filter input/select fields
   * Validates input and updates filter state
   */
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isValid = /^[A-Za-z0-9\s]*$/.test(value); // Regex to allow only letters, numbers and spaces

    // Validate filter inputs to prevent injection or invalid searches
    if (name === "generalSearch") {
      if (!isValid) {
        setInputErrors((prev) => ({
          ...prev,
          name: "Only letters, numbers and spaces are allowed.",
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
    setFilter((prevFilter) => {
        const updatedFilter = { ...prevFilter, [name]: value };
        // If it's the general search, trigger the debounced filter
        if (name === "generalSearch") {
            debouncedApplyFilters();
        }
        return updatedFilter;
    });
 };

 /**
  * Handles changes to checkbox filters 
  * Adds or removes a value from the respective filter category array
  * */
 const handleCheckboxFilterChange =(category: keyof typeof filter, value: string, checked: boolean) =>{
  setFilter((prev)=>{
    const currentValues = prev[category] as string[];
    if(checked){
      return{
        ...prev,
        [category] : [...currentValues, value], //Add value if checked
      };
    }else{
      return{
        ...prev,
        [category] : currentValues.filter((item)=>item!==value), //Remove value if unchecked
      };
    }
  });
 };

 /**Toggles selection of an applicant */
  const handleSelectApplicant = (applicantId: number) => {
    setSelectedApplicants((prev)=>({
      ...prev,
      [applicantId] : !prev[applicantId], //Toggle boolean status
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
        [applicantId] : validRank,//update rank for the given applicant
    }));

    //clear any previous rank-specfic error 
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
      [applicantId]: comment, //updating the comments for that applicant
    });
  };

  /**
   * Toggles course selection for an applicant
   * Either adds or removes a course from the selected courses list - for a specific applicant
   */
  const handleCourseToggle = (applicantId: number, courseID:number) =>{
    setCourseSelections((prev)=>{
      const selectedCourses = prev[applicantId] || []; //Get current selected courses for this applicant 
      const updatedCourses = selectedCourses.includes(courseID)
        ? selectedCourses.filter((id)=> id!==courseID) // Remove course if already selected
        : [...selectedCourses, courseID]; // Add course if not selected

        //clear specfic course-related error for this applicant if courses are being selected 
        if(updatedCourses.length>0){
          setRankErrors((prevErrors)=>{
            const newErrors = {...prevErrors};
            if(newErrors[applicantId] && newErrors[applicantId].includes("course")){
              delete newErrors[applicantId];
            }
            return newErrors;
          })
        }
      return {
        ...prev,
        [applicantId]:updatedCourses //update selected courses for this applicant
      }
    });
  };

  /**
   * Handles final submission of selected applicants
   * Validates ranks & selected Courses, and sends updates to backend
   */
const handleSubmit = async () => {

  const newRankErrors: {[key: number] : string} = {}; //Object to store validation errors for rranks & courses
  //Get all applicants that are currently in filteredApplicants state
  const allApplicantsToProcess = filteredApplicants;

  //check if any courses are selected for an applicant that is not selected itself.
  let coursesSelectedWithoutApplicant = false;
  for(const applicant of allApplicantsToProcess){
    const selectedCourses = courseSelections[applicant.applicationId] || [];
    if(selectedCourses.length > 0 && !selectedApplicants[applicant.applicationId]){
      coursesSelectedWithoutApplicant = true;
      toast({
        title: "Selection Error",
        description: `Please select ${applicant.name} before submitting.`,
        status: "error",
        duration: 5000,
        isClosable:true,
      });
      return;
    }
  }
  //separate selectedApplicants for rank/course validations
  const applicantsToSubmit = allApplicantsToProcess.filter(applicant => selectedApplicants[applicant.applicationId]);

  //check if any applicant is selected for submission
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

    //Now, iterate directly over each chosen applicant to validate that at least one course is selected
    applicantsToSubmit.forEach((app) => {
      const selectedCourses = courseSelections[app.applicationId] || [];
      if(selectedCourses.length === 0){ 
          newRankErrors[app.applicationId] = "Please select atleast one course for this applicant";
      }
    })
    
     //check for duplicate ranks among selected applicants
    const  ranksInUse: {[rank:number] : number[]} = {};
    applicantsToSubmit.forEach((app) => {
      const rank = rankedApplicants[app.applicationId];

      if(rank!==undefined && rank!==null){ //if a rank is assigned
        if(ranksInUse[rank]){
          ranksInUse[rank].push(app.applicationId); //Add applicant to the list for this rank
        }else{
          ranksInUse[rank] = [app.applicationId]//Initialize list for this rank
        }
      }
    });

   //Add error messages for duplicate ranks
    for(const rank in ranksInUse){
      if(ranksInUse[rank].length>1){
        ranksInUse[rank].forEach((id) => {
          newRankErrors[id] = `Rank ${rank} is already assigned to another applicant. Please chooose a unique rank.`;
        });
      }
    }

    //Display toast for validation errors
    if(Object.keys(newRankErrors).length>0){
      setRankErrors(newRankErrors); //Update state with all validation errors
      toast({
        title: "Validation Error",
        description: "Please resolve all validation errors before submitting",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    } else{
      setRankErrors({}); //clear all rank errors if no issues
    }

    try{
      setLoading(true);
      const updatePromises = allApplicantsToProcess.map(async (app)=>{
        const isCurrentlySelected = !!selectedApplicants[app.applicationId];
        let statusToSet : "approved" | "rejected" | "pending" = "pending"; //Pending by default

        if(isCurrentlySelected){
          statusToSet = "approved";
        }else if(app.isSelected){
          //if previously selected but now deselected
          statusToSet = "rejected";
        }else{
          statusToSet = "pending"
        }
      
      
        const updateDetails = {
          rank: isCurrentlySelected ? (rankedApplicants[app.applicationId] ?? null) : null, //Get rank or null
          comments: isCurrentlySelected ? (comments[app.applicationId] ?? null) : null, //Get comments or null
          selectedCourseIDs : isCurrentlySelected? (courseSelections[app.applicationId] ?? []) : [], //Get selected course IDs or empty array
          status: statusToSet,
          isSelected: isCurrentlySelected,
        };

        //only send update if there is a change
        const hasChanges = 
        app.isSelected !== updateDetails.isSelected || 
        app.status !== updateDetails.status || 
        app.rank !== updateDetails.rank || 
        app.comments !== updateDetails.comments ||
        JSON.stringify(app.selectedCourses.map(c=>c.courseID).sort()) !== JSON.stringify(updateDetails.selectedCourseIDs.sort());

        if(hasChanges){
        //call backend API to update the application
        await tutorApi.updateApplicationByLecturer(app.applicationId, updateDetails);
        }
       
        //Return full applicant object with updated fields for local state
        return{
          ...app,
          ...updateDetails,
          selectedCourses: app.courses.filter(course => updateDetails.selectedCourseIDs.includes(course.courseID)),
        };
      });

      const successfulUpdation = await Promise.all(updatePromises);
      //Filter for truly submitted applications for the 'submitted' view
      const newlySubmitted = successfulUpdation.filter(app => app.isSelected && app.status==="approved");
      //set submitted data and switch to 'submitted' view
      setSubmittedData(newlySubmitted);
      //Refetch all applications to ensure the local state is fully synchronized with backend
      await fetchAllApplications();
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
  };
 
  //Extract unique values for filter categories from all applicants
  const uniqueCandidateNames = Array.from(new  Set(applicants.map((app)=> app.name))).sort();
  const uniqueSessionTypes = Array.from(new  Set(applicants.map((app)=> app.sessionType))).sort();
  const uniqueAvailabilities = Array.from(new  Set(applicants.map((app)=> app.availability))).sort();
  const uniqueSkills = Array.from(new  Set(applicants.flatMap((app)=> app.skills.map((s)=> s.skillName)))).sort();
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
            <Text fontSize="4xl" fontWeight={"bold"} mb={6} color="white" textAlign="center" mt={4}>
              Lecturer Dashboard
            </Text>
  
            {applicants.length === 0 && !loading && !error ? (
            <Box
              position="relative"
              display="flex"
              justifyContent="center"
              alignItems="center"
              minH="400px"
              mb={6}
            >
            <Box
              position="relative"
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(20px)"
              borderRadius="3xl"
              border="1px solid rgba(255, 255, 255, 0.2)"
              boxShadow="0 25px 45px rgba(0, 0, 0, 0.1)"
              p={12}
              textAlign="center"
              maxW="600px"
              w="90%"
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                borderRadius: "3xl",
                zIndex: -1,
              }}
              transition="all 0.2s ease-in-out"
              _hover={{
              bg:"blue.700",
              color:"white",
              boxShadow:"0 0 10px rgba(173, 216, 230, 0.6)",
              transform: "scale(1.05)"
              }}
            >
              <VStack spacing={6}>
                <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  color="white"
                  textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
                  letterSpacing="wide"
                >
                  No Applications Available
                </Text>
            <Text
              fontSize="lg"
              color="rgba(255, 255, 255, 0.8)"
              textShadow="0 1px 2px rgba(0, 0, 0, 0.2)"
              maxW="400px"
              lineHeight="1.6"
            >
              There are currently no tutor applications to review. Please check back later or contact administration.
            </Text>
            
        
      </VStack>
    </Box>
  </Box>
            ): (
            <>
            {/* Filters Section */}
            <Box bg="white" p={6} rounded="2xl" boxShadow="lg" mb={6}>
            <VStack spacing={6} align="stretch">
              <HStack spacing = {4}>
              {/* General Search Input */}
              <Input 
                name="generalSearch" 
                placeholder="Search by Tutor Name, Course, Availability or Skills" 
                value={filter.generalSearch}
                onChange={handleFilterChange} 
                _hover={{
                  borderColor: "blue.500",
                  outline: "1px blue",
                }}
                _placeholder={{color:"gray.700"}}
              />
              </HStack>


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

              {/**Filter by categories */}
            <Accordion allowMultiple>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" textColor="gray.700" >
                     Apply Filters 
                    </Box>
                    <AccordionIcon/>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack spacing={4} align="stretch">
                       {/**Filter by Candidate Name */}
                    <Accordion allowMultiple>
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box flex ="1" textAlign="left">
                              Candidate Name
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                      <AccordionPanel pb={4}>
                        <VStack align="start">
                          {uniqueCandidateNames.map((name)=>(
                      <Checkbox
                      key = {name}
                      isChecked = {filter.candidateName.includes(name)}
                      onChange={(e)=> handleCheckboxFilterChange("candidateName", name,e.target.checked)}>
                        {name}
                      </Checkbox>
                    ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>

                  {/**Filter by SessionType */}
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          Filter By: Session Type
                        </Box>
                        <AccordionIcon/>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="start">
                        {uniqueSessionTypes.map((sessionType)=>(
                          <Checkbox
                          key = {sessionType}
                          isChecked = {filter.sessionType.includes(sessionType)}
                          onChange={(e)=> handleCheckboxFilterChange("sessionType", sessionType,e.target.checked)}>
                            {capitalizeWords(sessionType)}
                          </Checkbox>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>

                  {/**Filter by Availability */}
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          Filter By: Availability
                        </Box>
                        <AccordionIcon/>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="start">
                        {uniqueAvailabilities.map((availability)=>(
                          <Checkbox
                          key = {availability}
                          isChecked = {filter.availability.includes(availability)}
                          onChange={(e)=> handleCheckboxFilterChange("availability", availability,e.target.checked)}>
                            {capitalizeWords(availability)}
                          </Checkbox>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>

                  {/**Filter by Skills */}
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          Filter By: Skills
                        </Box>
                        <AccordionIcon/>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="start">
                        {uniqueSkills.map((skill)=>(
                          <Checkbox
                          key = {skill}
                          isChecked = {filter.skills.includes(skill)}
                          onChange={(e)=> handleCheckboxFilterChange("skills", skill,e.target.checked)}>
                            {capitalizeWords(skill)}
                          </Checkbox>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                  </Accordion>

              {/* Filter Action Buttons */}
              <HStack spacing={4} pt={4}>
                <Button 
                  onClick={applyFilters} 
                  colorScheme="blue"
                  isLoading={loading}
                  loadingText="Filtering..."
                  sx={{ cursor: "pointer" }}
                >
                  Apply Filters
                </Button>
                <Button 
                  onClick={clearFilters} 
                  variant="outline"
                  colorScheme="blue"
                  sx={{ cursor: "pointer" }}
                >
                  Clear All Filters
                </Button>
              </HStack>
            </VStack>
            </AccordionPanel>
            </AccordionItem>
            </Accordion>
                        
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
              
              
            </VStack>
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
                {[...filteredApplicants].sort((a, b) => {
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
            }).map((applicant) => (
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
                    
                    <Td textAlign="center">{capitalizeWords(applicant.skills.map(skill=>skill.skillName).join(", "))}</Td>
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
        )}
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
                    <Td textAlign="center">{capitalizeWords(applicant.skills.map(skill=>skill.skillName).join(", "))}</Td>
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