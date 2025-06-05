import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    VStack,
    Heading,
    Text,
    useToast,
    Flex,
    Spinner,
    Card,
    CardBody,
    HStack,
    Badge,
    Container,
    TableContainer,
    Table,
    Th,
    Thead,
    Tr,
    Tbody,
    Td
} from "@chakra-ui/react";
import {ChevronLeftIcon, EditIcon} from "@chakra-ui/icons"
import { useQuery, useMutation, gql, FetchResult} from "@apollo/client";

//GraphQL queries and mutations
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
    assignedCourses: {courseID: number} [];
}

interface QueryData{
    getCourses: Course[];
    getLecturers: User[];
}

export default function AssignLect(){
    //Apollo client hooks for data fetching and mutations
    const {data, loading, error, refetch} = useQuery<QueryData>(GET_LECTURERS_AND_COURSES);
    const [assignLect] = useMutation<QueryData>(ASSIGN_LECTURER);
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [selectedCourses, setSelectedCourses] = useState<Record<number, Set<number>>>({});
    const toast = useToast();
    
    const lecturers : User[] = data?.getLecturers || [];
    const courses: Course[] = data?.getCourses || [];

    
    //Initialize selected courses when data loads/lecturers change
    useEffect(()=>{
        if (data){
         const initialSelections : Record<number, Set<number>> = {};
         lecturers.forEach(lect=>{
            initialSelections[lect.id] = new Set(lect.assignedCourses.map((c)=>c.courseID));
         }) 
         setSelectedCourses(initialSelections);
        }
    },[data, lecturers]);

    const handleSelectCourses = () => {
        setView('edit');
    }

    const handleCourseToggle = (lectId: number, courseId: number) =>{
        setSelectedCourses((prev)=>{
            const updated = new Set(prev[lectId] || []);
            
            if(updated.has(courseId)){
                updated.delete(courseId);
            }else{
                updated.add(courseId);
            }
            return {
                ...prev,
                [lectId]: updated
            };
        });
    };

    const handleAssign = async() =>{
        const assignToDo: Promise<FetchResult<QueryData>>[] = [];
        const lectWithNoAssign : User[]= [];

        lecturers.forEach(lect=>{
            const coursesForLect = Array.from(selectedCourses[lect.id] || []);
            if(coursesForLect.length<1){
                lectWithNoAssign.push(lect);
            }else{
                assignToDo.push(
                    assignLect({variables: {userId: lect.id, courseIds: coursesForLect}}))
            }
        });

        if(lectWithNoAssign.length>0){
           toast({
            title: "Assignment Error",
            description: "Lecturers must be assigned to at least one course.",
            status: "error",
            duration: 5000,
            isClosable: true,
           });
           return;
        }

        try{
            await Promise.all(assignToDo);
             toast({
            title: "Lecturers Assigned Successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
           });
           setView('list');
           refetch();
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

    const handleBack = () =>{
        setView('list');
        //Re-initialize selectedCourses to reflect current assignments if user goes back
        const initialSelections: Record<number, Set<number>> = {};
        lecturers.forEach(lect=>{
            initialSelections[lect.id] = new Set(lect.assignedCourses.map((c)=>c.courseID));
         }) 
         setSelectedCourses(initialSelections);
    };

    const getAssignedCoursesNames = (lecturer: User) => {
        return lecturer.assignedCourses
        .map(ac=>courses.find(c=>c.courseID === ac.courseID))
        .filter(Boolean)
        .map(c=> c!.courseName);
    };


    if(loading)
        return (
    <Flex bgGradient="linear(to-br, blue.600, black)" minH="100vh" px={[4, 6, 12]} py={16} justify="center" align="center">
        <Spinner size="xl" color="white"/>
        <Text ml={4} color="white" fontSize="xl">Loading Data...</Text>
    </Flex>);
    
    if(error)
      return (
    <Flex bgGradient="linear(to-br, blue.600, black)" minH="100vh" px={[4, 6, 12]} py={16} justify="center" align="center">
        <Spinner size="xl" color="white"/>
        <Text ml={4} color="white" fontSize="xl">Error Loading Data: {error.message}</Text>
    </Flex>
    );

    if(view==='list'){
        return(
            <Box bgGradient="linear(to-br, blue.600, black)" minH="100vh" px={[4, 6, 12]} py={20}>
            <Heading mb={2} textAlign="center" color="white" fontSize="3xl" py="10">
             Assign Lecturers To Courses
            </Heading>

            <Box px={6} py={10} maxW="6xl" mx="auto" bg="white" borderRadius="lg" shadow="xl">
            <VStack spacing={8} align="stretch">
                

                    <Button
                    leftIcon={<EditIcon/>}
                    colorScheme="blue"
                    size="lg"
                    onClick={handleSelectCourses}
                    >
                     Edit Assignments   
                    </Button>
               

                <HStack spacing={6} justifyContent="center" flexWrap="wrap" align="stretch">
                {lecturers.map((lect)=>{
                    const assignedCourses = getAssignedCoursesNames(lect);
                    return(
                        <Card
                        key={lect.id}
                        shadow="md"
                        borderRadius="lg"
                        transition="all 0.2s"
                        _hover={{
                            shadow: "lg",
                            transform: "translateY(-2px)"
                        }}
                      
                        >
                            <CardBody>
                                <VStack spacing={2}>
                                 <Text textAlign="center" fontSize="lg" fontWeight="bold"  color="blue.700">
                                    {lect.firstName} {lect.lastName}
                                 </Text>
                                <Text fontWeight="semibold" fontSize="md" color="blue.700">
                                    {lect.email}
                                </Text>

                                <HStack align="start" spacing={2} flexWrap="wrap">
                                    {assignedCourses.length>0?(
                                        assignedCourses.map((courseName, index)=>(
                                            <Badge
                                            key={index}
                                            colorScheme="blue"
                                            variant="subtle"
                                            fontSize="sm"
                                            >
                                           {courseName}
                                            </Badge>
                                        ))
                                    ):(
                                        <Badge colorScheme="gray" variant="subtle" fontSize="sm">
                                            No Courses Assigned
                                        </Badge>
                                    )}
                                </HStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    );
                })}
                </HStack>
            </VStack>
            </Box>
            </Box>
        );
    }


    return(
       <Box bgGradient="linear(to-br, blue.600, black)" minH="100vh" px={[4, 6, 12]} py={20}>
            <Heading mb={2} textAlign="center" color="white" fontSize="3xl" py="10">
             Assign Lectures To Courses
        </Heading>
            <Box px={2} py={10} maxW="9xl" mx="auto" bg="white" borderRadius="lg" shadow="xl">
                    
                <Container maxW="9xl">
                    <HStack mb={6}>
                        <Button
                        leftIcon={<ChevronLeftIcon/>}
                        colorScheme="blue"
                        size="lg"
                        onClick={handleBack}
                        >
                            Back To List
                        </Button>
                       
                    </HStack>

                    <TableContainer>
                        <Table variant="simple" size="md">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th fontSize="md">Lecturers</Th>
                                    {courses.map((course)=>(
                                        <Th key={course.courseID} textAlign="center" minW="120px">
                                            <VStack spacing={1}>
                                                <Text fontSize="sm" fontWeight="bold">
                                                    {course.courseName}
                                                </Text>
                                                <Badge 
                                                size="xs"
                                                colorScheme={
                                                    course.semester === "1"?'yellow' : course.semester === "2"? 'green' : 'blue'
                                                }
                                                variant="subtle"
                                                >Semester {course.semester}</Badge>
                                            </VStack>
                                        </Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {lecturers.map((lect)=>(
                                    <Tr 
                                    key ={lect.id}
                                    transition="background-color 0.2s"
                                    >
                                     <Td>
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="bold" fontSize="md" color="blue.700">
                                                {lect.firstName} {lect.lastName}
                                            </Text>
                                            <Text fontSize="sm" color="blue.700">
                                                {lect.email}
                                            </Text>
                                        </VStack>
                                    </Td>   
                                    {courses.map((course)=>(
                                        <Td 
                                        key={course.courseID} textAlign="center">
                                            <Checkbox 
                                            isChecked={selectedCourses[lect.id]?.has(course.courseID)||false}
                                            onChange={()=>handleCourseToggle(lect.id, course.courseID)}
                                            colorScheme="blue"
                                            />
                                        </Td>
                                    ))}
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                    <Button
                    colorScheme="green"
                    size="lg"
                    onClick={handleAssign}
                    mt={6}
                    w="full"
                    >
                        Submit Assignments
                    </Button>
                </Container>

            </Box>
        </Box>
    );
}

