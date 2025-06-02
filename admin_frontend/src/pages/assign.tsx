import React, {useState} from "react";
import {
    Box,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Button,
    Checkbox,
    VStack,
    Heading,
    Text,
    useToast
} from "@chakra-ui/react";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_LECTURERS_AND_COURSES = gql `
query GetLectAndCourses{
    getLecturers{
    id
    firstName
    lastName
    email
    assignedCourses{
        courseID
        }
    } 
    getCourses{
    courseID
    courseName
    semester
    }
}
`;


const ASSIGN_LECTURER = gql `
mutation AssignLect($userId: ID!, $courseIds: [ID!]!){
    assignLectToCourses(userId: $userId, courseIds: $courseIds)
}
`;

interface Course{
    courseID: number;
    courseName: string;
    courseCode: string;
    semester: string;
}

interface User{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface QueryData{
    getCourses: Course[];
    getLecturers: User[];
}

export default function AssignLect(){
    const {data, loading, error} = useQuery<QueryData>(GET_LECTURERS_AND_COURSES);
    const [assignLect] = useMutation<QueryData>(ASSIGN_LECTURER);
    const [selectedCourses, setSelectedCourses] = useState<Record<number, Set<number>>>({});
    const toast = useToast();
    
    const handleCourseToggle = (userId: number, courseId: number) =>{
        setSelectedCourses((prev)=>{
            const updated = new Set(prev[userId] || []);
            
            if(updated.has(courseId)){
                updated.delete(courseId);
            }else{
                updated.add(courseId);
            }
            return {
                ...prev,
                [userId]: updated
            };
        });
    };

    const handleAssign = async(userId: number) =>{
        const courses = Array.from(selectedCourses[userId] || []);
        if(courses.length<1){
           toast({
            title: "Validation Error",
            description: "A lecturer must be assigned to at least one course.",
            status: "error",
            duration: 5000,
            isClosable: true,
           });
           return;
        }

        try{
            await assignLect({variables: {userId, courseIds: courses}});
             toast({
            title: "Lecturer Assigned Successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
           });
        }catch(error){
            toast({
            title: "Failed To Assign Lecturer ",
            description: `${error}`,
            status: "error",
            duration: 5000,
            isClosable: true,
           });
            console.error("Error while assigning courses");
        }
    };

    if(loading)
        return <Text>Loading...</Text>
    
    if(error)
        return <Text>Error loading data...</Text>


    const lecturers : User[] = data?.getLecturers || [];
    const courses : Course[] = data?.getCourses || [];

    return(
        <Box p={8} maxW="4xl" mx="auto">
            <Heading mb={6}>Assign Lecturers To Courses</Heading>
            <Accordion allowToggle>
               {lecturers.map((lecturer)=>(
                <AccordionItem key={lecturer.id}>
                     <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  {lecturer.firstName} {lecturer.lastName} ({lecturer.email})
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              <VStack align="start" spacing={2}>
                {courses.map((course) => (
                  <Checkbox
                    key={course.courseID}
                    isChecked={selectedCourses[lecturer.id]?.has(course.courseID) || false}
                    onChange={() => handleCourseToggle(lecturer.id, course.courseID)}
                  >
                    {course.courseName} (Sem {course.semester})
                  </Checkbox>
                ))}
              </VStack>
              <Button
                mt={4}
                colorScheme="blue"
                onClick={() => handleAssign(lecturer.id)}
              >
                Assign Courses
              </Button>
            </AccordionPanel>
                </AccordionItem>
               ))}
            </Accordion>
        </Box>
    );
}

