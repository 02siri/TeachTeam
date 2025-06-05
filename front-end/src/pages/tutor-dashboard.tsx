import { useState, useEffect} from "react";
import React from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  VStack,
  SimpleGrid,
  HStack,
  Image,
  Flex,
  useToast,
  Tooltip
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthLogic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tutorApi } from "../services/api";



//motion-enhanced Chakra components..
const MotionBox = motion(Box); 
const MotionVStack = motion(VStack); 

export interface Tutor {
  email: string;
  role?: string[];
  sessionType: string | string[]; 
  courses: { courseCode: string; courseName: string; semester: string; description: string }[];
  previousRoles: string[];
  availability: string;
  timestamp: string;
  user?: {
    skills?: { skillName: string }[];
    credentials?: { qualification: string; institution: string; year: number }[];
  };
}



const TutorDashboard = () => {
  const {currentUserEmail} = useAuth();   //get the currently authenticated user..

  const isStudent = currentUserEmail?.endsWith("@student.rmit.edu.au");

  type CourseOption = {
    id: string;
    name: string;
    semester: string;
    description: string;
  };
  

  //state variables to manage form data..
  //role, courses, previous roles, availability, skills, academic credentials, custom skills..
  //and errors..
  const [role, setRole] = useState<string>(""); 
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [previousRoles, setPreviousRoles] = useState([""]);
  const [availability, setAvailability] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [academicCred, setAcademicCred] = useState([
    { qualification: "", institution: "", year: "" }
  ]);  
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});    
  const [existingApplication, setExistingApplication] = useState<Tutor | null>(null);
  const [appliedRoles, setAppliedRoles] = useState<string[]>([]);
  const [appliedCourseIds, setAppliedCourseIds] = useState<string[]>([]);
  const STANDARD_SKILLS = React.useMemo(() => ["HTML", "CSS", "JAVASCRIPT", "REACT"], []);
  const hasAppliedBothRoles = appliedRoles.includes("tutor") && appliedRoles.includes("lab");
  const [isSubmitting, setIsSubmitting] = useState(false);






  //validation function for the form..
  //checks if the required fields are filled and sets error messages accordingly..
  //returns true if all validations pass..
  //if any field is empty, it sets the error message for that field..
  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};
  
    if (!role) newErrors.role = "Please select one role";
    if (courses.length === 0) newErrors.courses = "Select at least one course";
    if (previousRoles.some((r) => r.trim() === "")) newErrors.previousRoles = "Enter previous role";
    if (!availability) newErrors.availability = "Select availability";
    if (skills.length === 0) newErrors.skills = "Select at least one skill";
  
    const hasInvalidCred = academicCred.some((c) => {
      const year = parseInt(c.year);
      return (
        !c.qualification?.trim() ||
        !c.institution?.trim() ||
        isNaN(year) ||      
        year < 1900 ||       
        year > 2099         
      );
    });
  
    if (hasInvalidCred) {
      newErrors.academicCred = "Enter a valid qualification, institution, and year (1900–2099)";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  
  


  //toggle function for role selection..
  //if the selected role is already in the array, remove it..
  //otherwise, add it to the array..
  //this allows multiple roles to be selected..
  const toggleRole = (selectedRole: string) => {
    setRole((prev) => (prev === selectedRole ? "" : selectedRole));
  };

  useEffect(() => {
  const fetchCourses = async () => {
    try {
      const coursesFromDB = (await tutorApi.getCourses()) ?? [];
      const formatted: CourseOption[] = coursesFromDB.map((course: {
        courseCode: string;
        courseName: string;
        semester: string;
        description: string;
      }) => ({
        id: course.courseCode,
        name: course.courseName,
        semester: course.semester,
        description: course.description,
      }));
      setCourseOptions(formatted);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  fetchCourses();
}, []);

  


useEffect(() => {
  const fetchApplication = async () => {
    if (!currentUserEmail || courseOptions.length === 0) return;

    try {
      const data = await tutorApi.getApplicationByEmail(currentUserEmail);
      if (data && data.length > 0) {
        // Use the tutor application if available, otherwise pick the first one
        const preferredApplication = data.find(app => app.sessionType.includes("tutor")) || data[0];

        setExistingApplication({
          ...preferredApplication,
          email: preferredApplication.email ?? currentUserEmail,
          sessionType: Array.isArray(preferredApplication.sessionType)
            ? preferredApplication.sessionType[0] || ""
            : preferredApplication.sessionType || ""
        });
        // Prefill sessionType as role
        if (preferredApplication.sessionType && preferredApplication.sessionType.length > 0) {
          const capitalized = preferredApplication.sessionType[0] === "tutor" ? "Tutor" : "Lab Assistant";
          setRole(capitalized);
        }
        const rolesApplied = data.map(app => 
          Array.isArray(app.sessionType)
            ? app.sessionType[0]?.toLowerCase() || ""
            : (app.sessionType as string).toLowerCase()
        );
        setAppliedRoles(rolesApplied);

        

        // Prefill courses
        if (preferredApplication.courses?.length > 0) {
          const selectedCourseIds = preferredApplication.courses.map((c) => c.courseCode);
          const matched = courseOptions.filter(option =>
            selectedCourseIds.includes(option.id)
          );
          setCourses(matched);
          setAppliedCourseIds(selectedCourseIds);
        }

        // Prefill previous roles
        if (preferredApplication.previousRoles) {
          setPreviousRoles(preferredApplication.previousRoles);
        }

        // Prefill availability
        if (preferredApplication.availability) {
          setAvailability(preferredApplication.availability);
        }

        // Prefill skills
        const skillNames = preferredApplication.skills?.map((s) => s.skillName) || [];
        const normalizedSkillNames = skillNames.map((s) => s.trim().toUpperCase());
        const predefinedSelected = STANDARD_SKILLS.filter((skill) => normalizedSkillNames.includes(skill));
        const otherSkills = skillNames.filter((s) => !STANDARD_SKILLS.includes(s.trim().toUpperCase()));
        const updatedSkills = [...predefinedSelected];
        if (otherSkills.length > 0) updatedSkills.push("Other");
        setSkills(updatedSkills);
        setCustomSkills(otherSkills);

        // Prefill academic credentials
        const creds = preferredApplication.academicCredentials || [];
        if (creds.length > 0) {
          setAcademicCred(
            creds.map((c) => ({
              qualification: c.qualification,
              institution: c.institution,
              year: c.year.toString(),
            }))
          );
        }        
      }
    } catch{
      console.error("No application found for user");
    }
  };

  fetchApplication();
}, [currentUserEmail, courseOptions, STANDARD_SKILLS]);


  



  //merge skills and custom skills
  //if "Other" is selected, merge custom skills with the existing skills
  const mergedSkills = skills.includes("Other")
      ? [...skills.filter((s) => s !== "Other"), ...customSkills.filter((s) => s.trim() !== "")]
      : skills;

  const academicCredentialsPayload = academicCred
  .filter((c) => c.qualification && c.institution && c.year)
  .map((c) => ({
    qualification: c.qualification.trim(),
    institution: c.institution.trim(),
    year: parseInt(c.year)
  }));
    




  const handleApply = async () => {
  if (!validateStep() || !currentUserEmail) return;

  setIsSubmitting(true); 

  const applicationData = {
    email: currentUserEmail,
    role: [role],
    sessionType: role === "Tutor" ? "tutor" : "lab",
    courses: courses.map((c) => c.id),
    previousRoles,
    availability,
    skills: mergedSkills,
    academicCred: academicCredentialsPayload,
    timestamp: new Date().toISOString(),
  };

  try {
    await tutorApi.submitApplication({
      ...applicationData,
      skills: mergedSkills,
      academicCred: academicCredentialsPayload,
      sessionType: [],
    });

    await tutorApi.submitSkills(currentUserEmail, skills, customSkills);
    await tutorApi.submitCredentials(currentUserEmail, academicCredentialsPayload);

    toast({
      position: "top",
      duration: 2000,
      isClosable: true,
      render: () => (
        <Box
          color="white"
          px={6}
          py={4}
          rounded="md"
          shadow="lg"
          bgGradient="linear(to-r, green.400, green.600)"
        >
          <Text fontWeight="bold" fontSize="lg">🎉 Application Submitted!</Text>
          <Text mt={1}>Your application has been saved to the server.</Text>
        </Box>
      ),
    });

    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error("Error saving tutor application", error);
  } finally {
    setTimeout(() => setIsSubmitting(false), 2000); 
  }
};



  //toast notification for success message..
  //this is shown when the user successfully submits their application..
  //it shows a success message with a green gradient background..
  //the toast is positioned at the top of the screen and disappears after 2 seconds..
  //it also has a close button to dismiss the toast manually..
  //the toast is created using the useToast hook from Chakra UI..
  const toast = useToast();

  //so this is just for lecturer.. incase u try to login as lecturer and give the URL this won't allow hte lecturer to apply..
  if (!isStudent) {
    return (
      <>
        <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={10}>
          <Box textAlign="center" p={6} bg="white" shadow="xl" rounded="md">
            <Text fontSize="2xl" fontWeight="bold" color="red.500">Access Denied</Text>
            <Text mt={2}>This page is only accessible to students.</Text>
          </Box>
        </Flex>
      </>
    );
  }
  

  return (
    <>
    {/*header component*/}
    <Header />   

    {/*motion-enhanced box for the background*/}
    {/*it also has a motion effect that fades in when the component mounts*/}                   
    <MotionBox 
    p={20} 
    bgGradient="linear(to-br, blue.600, black)" 
    minH="100vh" 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.5 }}>
      <Box position="relative">
          <Box filter={hasAppliedBothRoles ? "blur(3px)" : "none"} pointerEvents={hasAppliedBothRoles ? "none" : "auto"}>
          

      {/*motion-enhanced vertical stack for the form*/}
      {/*it also has a motion effect that slides in from the top when the component mounts*/}
      <MotionVStack
        bg="white"
        p={8}
        rounded="xl"
        shadow="2xl"
        maxW="4xl"
        mx="auto"
        minH="100vh"
        spacing={6}
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Text fontSize="3xl" fontWeight="bold">
          Apply to Teach 
        </Text>
        
        
        
        {/* Step 1: Role Selection */}
          {/*this step allows the user to select their role*/}
          {/*the user can select either Tutor or Lab Assistant or both roles*/}
          {/*this is done using a vertical stack of buttons*/}
          {/*the selected role is stored in the role state variable*/}
          {/*if the user doesn't select anything, an error message is shown*/}
          <FormControl p={5} bg="gray.50" borderRadius="md" shadow="sm">
            <FormLabel
            textAlign="center"
            width="100%"
            fontSize="xl"
            fontWeight="bold"
            color="blue.800"
            mb={6}
            >
              Tell us the role you&apos;re interested in:
              </FormLabel>
              
              <HStack spacing={6} justify="center">
                
                
              {/* Tutor */}
              {/*this is a motion-enhanced vertical stack for the Tutor role*/}
              <MotionVStack
              spacing={2}
              onClick={() => {
              if (!appliedRoles.includes("tutor")) toggleRole("Tutor");
            }}
            pointerEvents={appliedRoles.includes("tutor") ? "none" : "auto"}
            opacity={appliedRoles.includes("tutor") ? 0.6 : 1}
            borderColor={
              appliedRoles.includes("tutor")
              ? "gray.500"
              : role === "Tutor"
              ? "blue.500"
              : "gray.300"
            }
            bg={
              appliedRoles.includes("tutor")
              ? "gray.100"
              : role === "Tutor"
              ? "blue.50"
              : "white"
            }
              cursor="pointer"
              align="center"
              borderWidth="2px"
              p={3}
              rounded="md"
              _hover={{ borderColor: "blue.500" }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              >
                <Image src="tutor.png" alt="Tutor" width={200} height={200} />
                <Text fontWeight="bold">Tutor</Text>
                </MotionVStack>
                

              {/* Lab Assistant */}
              {/*this is a motion-enhanced vertical stack for the Lab Assistant role*/}
              <MotionVStack
              spacing={2}
              cursor="pointer"
              align="center"
              borderWidth="2px"
              onClick={() => {
                if (!appliedRoles.includes("lab")) toggleRole("Lab Assistant");
              }}
              pointerEvents={appliedRoles.includes("lab") ? "none" : "auto"}
              opacity={appliedRoles.includes("lab") ? 0.6 : 1}
              borderColor={
                appliedRoles.includes("lab")
                ? "gray.500"
                : role === "Lab Assistant"
                ? "blue.500"
                : "gray.300"
              }
              bg={
                appliedRoles.includes("lab")
                ? "gray.100"
                : role === "Lab Assistant"
                ? "blue.50"
                : "white"
              }
              p={3}
              rounded="md"
              _hover={{ borderColor: "blue.500" }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              >
                <Image src="lab_assistant.png" alt="Lab Assistant" width={200} height={200} />
                <Text fontWeight="bold">Lab Assistant</Text>
                </MotionVStack>
                </HStack>
                  
                {errors.role && (
                  <Text color="red.500" fontSize="sm" mt={4}>{errors.role}</Text>
                  )}
              </FormControl>



          {/* Step 2: Courses Available */}
          {/*this step allows the user to select the courses they want to support*/}
          {/*the user can select multiple courses from a list*/}
          {/*this is done using a checkbox group*/}
          {/*the selected courses are stored in the courses state variable*/}
          <FormControl p={5} bg="gray.50" borderRadius="md" shadow="sm">
            <FormLabel
            textAlign="center"
            width="100%"
            fontSize="xl"
            fontWeight="bold"
            color="blue.800"
            mb={6}
            >
             Which course(s) would you like to support?
              </FormLabel>
              <CheckboxGroup
              colorScheme="blue"
              value={courses.map((c) => c.id).filter(id => !appliedCourseIds.includes(id))}

              onChange={(selectedIds) => {
                const selectedCourses = courseOptions.filter((course) =>
                  selectedIds.includes(course.id)
              );
              setCourses(selectedCourses); 
              }}
              >
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} px={2}>
                {courseOptions.map((course) => (
                <Tooltip
                key={course.id}
                label={
                <Box>
                  <Text fontWeight="bold">Semester: {course.semester}</Text>
                  <Text>Description: {course.description}</Text>
                  </Box>
                }
                placement="bottom"
                hasArrow
                bg="gray.700"
                color="white"
                p={3}
                rounded="md"
                maxW="300px"
                >
                <span>
                <Checkbox
                value={course.id}
                py={2}
                px={3}
                borderRadius="md"
                _hover={{ bg: "blue.50" }}
                whiteSpace="normal"
                isDisabled={appliedCourseIds.includes(course.id)}
                isChecked={!appliedCourseIds.includes(course.id) && courses.some((c) => c.id === course.id)}
                onChange={() => {}}
                opacity={((existingApplication as Tutor)?.courses || []).some((c) => c.courseCode === course.id) ? 0.6 : 1}
                >
                  <Text fontWeight="medium">{course.id}: {course.name}</Text>
                  </Checkbox>
                  </span>
                  </Tooltip>
                ))}
                </SimpleGrid>
                </CheckboxGroup>
                {errors.courses && (
                  <Text color="red.500" fontSize="sm" mt={3}>
                    {errors.courses}
                    </Text>
                  )}
                  </FormControl>

        {/* Step 3: Previous Roles */}
          {/*this step allows the user to enter their previous roles*/}
          {/*the user can add multiple previous roles*/}
          {/*if the user doesn't add anything, an error message is shown*/}
          {/*the previous roles are stored in the previousRoles state variable*/}
          {/*this is done using a text input field*/}
          <FormControl p={5} bg="gray.50" borderRadius="md" shadow="sm">
            <FormLabel
            textAlign="center"
            width="100%"
            fontSize="xl"
            fontWeight="bold"
            color="blue.800"
            mb={6}
            >
              Your experience matters! Share your previous roles:
              </FormLabel>
              {previousRoles.map((role, index) => (
                <HStack key={index} spacing={3} mb={3}>
                  <Input
                  placeholder="e.g. Lab Assistant, Tutor..."
                  value={role}
                  onChange={(e) => { 
                    const updatedRoles = [...previousRoles];
                    updatedRoles[index] = e.target.value;
                    setPreviousRoles(updatedRoles);
                  }}
                  bg="white"
                  borderColor="gray.300"
                  focusBorderColor="blue.500"
                  />
                  <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => setPreviousRoles([...previousRoles, ""])}
                  > 
                  +
                  </Button>
                  {previousRoles.length > 1 && (
                    <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => {
                      const updatedRoles = previousRoles.filter((_, i) => i !== index);
                      setPreviousRoles(updatedRoles);
                    }}
                    >
                      -
                      </Button>
                    )}
                    </HStack>
                  ))}
                  {errors.previousRoles && (
                    <Text color="red.500" fontSize="sm" mt={2}>
                      {errors.previousRoles}
                      </Text>
                    )}
                      </FormControl>


        {/* Step 4: Availability */}
          {/*this step allows the user to select their availability*/}
          {/*the user can select either part-time or full-time availability*/}
          {/*this is done using a select dropdown*/}
          {/*the selected value is stored in the availability state variable*/}
          {/*if the user doesn't select anything, an error message is shown*/}
          <FormControl p={5} bg="gray.50" borderRadius="md" shadow="sm">
            <FormLabel
            textAlign="center"
            width="100%"
            fontSize="xl"
            fontWeight="bold"
            color="blue.800"
            mb={6}
            >
              Choose your availability for tutoring:
              </FormLabel>
              <Select
              placeholder="Select your availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              bg="white"
              borderColor="gray.300"
              focusBorderColor="blue.500"
              mb={errors.availability ? 2 : 6}
              >
                <option value="Part-Time">Part-Time</option>
                <option value="Full-Time">Full-Time</option>
                </Select>
                {errors.availability && (
                  <Text color="red.500" fontSize="sm" mb={4}>
                    {errors.availability}
                    </Text>
                  )}
                    </FormControl>


        {/* Step 5: Skills List */}
          {/*this step allows the user to select their skills*/}
          {/*the user can select multiple skills from a list*/}
          {/*if the user selects "Other", they can add custom skills*/}
          {/*this is done using a checkbox group*/}
          {/*the selected skills are stored in the skills state variable*/}
          {/*if the user doesn't select anything, an error message is shown*/}
          <FormControl p={5} bg="gray.50" borderRadius="md" shadow="sm">
            <FormLabel
            textAlign="center"
            width="100%"
            fontSize="xl"
            fontWeight="bold"
            color="blue.800"
            mb={6}
            >
              Which tools and languages are you confident with?
              </FormLabel>
              <CheckboxGroup
              colorScheme="blue"
              value={skills}
              onChange={(value) => setSkills(value as string[])}
              >
                <Stack spacing={3} pl={2}>
                  {STANDARD_SKILLS.map((skill) => (
                    <Checkbox key={skill} value={skill}>
                      {skill}
                      </Checkbox>
                    ))}
                  <Checkbox
                  value="Other"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSkills([...skills, "Other"]);
                    } else {
                      setSkills(skills.filter((s) => s !== "Other"));
                      setCustomSkills([]);
                    }
                  }}
                  >
                    Other
                    </Checkbox>
                    </Stack>
                    </CheckboxGroup>
                    {/* Custom Skills Section - only shows when Other skilld is selected */}
                    {/*this section allows the user to add custom skills*/}
                    {/*the user can add multiple custom skills*/}
                    {/*if the user doesn't add anything, an error message is shown*/}
                    {/*the custom skills are stored in the customSkills state variable*/}
                    {/*if the user selects "Other", they can add custom skills*/}
                    {skills.includes("Other") && (
                      <>
                      <FormLabel
                      mt={6}
                      mb={2}
                      fontSize="md"
                      fontWeight="semibold"
                      color="blue.700"
                      >
                        Got more skills? Add them here 👇
                        </FormLabel>
                        {customSkills.map((skill, index) => (
                          <HStack key={index} spacing={3} mb={2}>
                            <Input
                            placeholder="Enter other skill"
                            value={skill}
                            onChange={(e) => {
                              const updatedSkills = [...customSkills];
                              updatedSkills[index] = e.target.value;
                              setCustomSkills(updatedSkills);
                            }}
                            bg="white"
                            borderColor="gray.300"
                            focusBorderColor="blue.500"
                            />
                            <Button
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => setCustomSkills([...customSkills, ""])}
                            >
                              +
                              </Button>
                              {customSkills.length > 1 && (
                                <Button
                                colorScheme="red"
                                variant="outline"
                                onClick={() =>
                                  setCustomSkills(customSkills.filter((_, i) => i !== index))
                                }
                                >
                                  -
                                  </Button>
                                )}
                                </HStack>
                              ))}
                              <Button
                              mt={3}
                              colorScheme="blue"
                              variant="solid"
                              onClick={() => setCustomSkills([...customSkills, ""])}
                              >
                                + Add Another Skill
                                </Button>
                                </>
                              )}
                              {errors.skills && (
                                <Text color="red.500" fontSize="sm" mt={3}>
                                  {errors.skills}
                                  </Text>
                                )}
                                  </FormControl>

        {/* Step 6: Academic Credentials */}
          {/*this step allows the user to enter their academic credentials*/}
          {/*the user can add multiple academic credentials*/}
          {/*if the user doesn't add anything, an error message is shown*/}
          {/*the academic credentials are stored in the academicCred state variable*/}
          {/*if the user doesn't add anything, an error message is shown*/}
          <FormControl p={5} bg="gray.50" borderRadius="md" shadow="sm" isInvalid={!!errors.academicCred}>
            <FormLabel
            textAlign="center"
            width="100%"
            fontSize="xl"
            fontWeight="bold"
            color="blue.800"
            mb={6}
            >
              Tell us more about your academic journey ✨
              </FormLabel>
              {academicCred.map((cred, index) => (
                <HStack key={index} spacing={3} mb={3}>
                  <Input
                  placeholder="Qualification(e.g. Diploma)"
                  value={cred.qualification}
                  isInvalid={!!errors.academicCred}
                  onChange={(e) => {
                    const updated = [...academicCred];
                    updated[index].qualification = e.target.value;
                    setAcademicCred(updated);
                  }}
                  />
                  <Input
                   placeholder="Institution(e.g. RMIT)"
                   value={cred.institution}
                   isInvalid={!!errors.academicCred}
                   onChange={(e) => {
                    const updated = [...academicCred];
                    updated[index].institution = e.target.value;
                    setAcademicCred(updated);
                  }}
                  />
                   <Input
                   placeholder="Year (e.g. 2025)"
                   type="number"
                   min={1900}
                   max={2099}
                   step={1}
                   value={cred.year?.toString() || ""}
                   isInvalid={!!errors.academicCred}
                   onChange={(e) => {
                    const updated = [...academicCred];
                    updated[index].year = e.target.value.replace(/\D/g, "");
                    setAcademicCred(updated);
                    }}
                    />

                    <Button onClick={() => setAcademicCred([...academicCred, { qualification: "", institution: "", year: "" }])}>+</Button>
                    {academicCred.length > 1 && (
                      <Button colorScheme="red" onClick={() => setAcademicCred(academicCred.filter((_, i) => i !== index))}>-</Button>
                       )}
                       </HStack>
                      ))}
                      {errors.academicCred && (
                        <Text color="red.500" fontSize="sm" mt={2}>
                          {errors.academicCred}
                          </Text>
                        )}

                      </FormControl>

                {/* Final Submit Button */}
                {/*this step allows the user to submit their application*/}
                {/*the user can click the Apply button to submit their application*/}
                {/*if the user doesn't fill in all the required fields, an error message is shown*/}
                {/*the application data is saved to local storage*/}
                {/*the user can also click the Save button to save their application data*/}                     
                <Flex direction="column" align="center" mt={6} gap={4}>
                  <Button
                  onClick={handleApply}
                  isDisabled={isSubmitting || appliedRoles.includes(role.toLowerCase())}
                  isLoading={isSubmitting}
                  px={6}
                  py={4}
                  borderRadius="full"
                  border="1px solid"
                  borderColor="green.500"
                  color="green.500"
                  bg="transparent"
                  _hover={{
                    bg: "green.500",
                    color: "white",
                    boxShadow: "0 0 10px rgba(0, 128, 0, 0.5)",
                  }}
                  transition="all 0.3s"
                  shadow="sm"
                  >
                    Apply
                    </Button>
                    </Flex>


      </MotionVStack>
        </Box>
          {hasAppliedBothRoles && (
            <Flex position="absolute" top={0} left={0} w="100%" h="100%" align="center" justify="center" zIndex={10} p={6}>
              <Box
              bgGradient="linear(to-br, white, gray.100)"
              p={8}
              rounded="2xl"
              shadow="2xl"
              textAlign="center"
              maxW="lg"
              border="1px solid"
              borderColor="gray.200"
              >
                <Text fontSize="2xl" fontWeight="bold" mb={4} color="blue.800">
                   🎉 You&apos;ve already applied for both roles!
                   </Text>
                   <Text fontSize="md" color="gray.700">
                     You have submitted applications for both <strong>Tutor</strong> and <strong>Lab Assistant</strong>.
                     <br />
                      Please go to your <strong>Profile</strong> to check your application status or contact the admin for updates.
                   </Text>
                  </Box>
                </Flex>
                )}
              </Box>
          </MotionBox>
      <Footer />
    </>
  );
};

export default TutorDashboard;
