import React, {useEffect, useState, useMemo} from "react";
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
import { useQuery, useMutation, gql, FetchResult} from "@apollo/client";

//GraphQL queries fetching lecturers and courses
const GET_LECTURERS_AND_COURSES = gql `
query GetLectAndCourses{
    getLecturers{
    id
    firstName
    lastName
    email
    dateOfJoining
    assignedCourses{
        courseID
        }
    } 
    getCourses{
    courseID
    courseName
    courseCode
    semester
    }
}
`;

//Graphlql mutation for assigning courses to lecturers
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
    dateOfJoining: string;
    assignedCourses: {courseID: number} [];
}

interface QueryData{
    getCourses: Course[];
    getLecturers: User[];
}

export default function AssignLect(){
    //Apollo client hooks for data fetching and mutations
    const {data, loading, error, refetch} = useQuery<QueryData>(GET_LECTURERS_AND_COURSES);
    //mutation function to assign courses to lecturers
    const [assignLect] = useMutation<QueryData>(ASSIGN_LECTURER);
    //state to manage current view
    const [view, setView] = useState<'list' | 'edit'>('list');
    //state to store selected courses for each lecturer : storing as a Record of key-value pair
    const [selectedCourses, setSelectedCourses] = useState<Record<number, Set<number>>>({});
    const toast = useToast();
    
    //Memoized lecturers and courses data from query reult
    const lecturers = useMemo(()=> data?.getLecturers || [], [data?.getLecturers]);
    const courses = useMemo(()=> data?.getCourses || [], [data?.getCourses]);

    
    //Initialize/Restore selected courses when data loads/lecturers change
    useEffect(()=>{
        if (data){
         const initialSelections : Record<number, Set<number>> = {};
         lecturers.forEach(lect=>{
            initialSelections[lect.id] = new Set(lect.assignedCourses.map((c)=>c.courseID));
         }) 
         setSelectedCourses(initialSelections);
        }
    },[data, lecturers]);

    //handler to swtich to edit view
    const handleSelectCourses = () => {
        setView('edit');
    }

    //handler for toggline the selection of course for specific lecturer
    const handleCourseToggle = (lectId: number, courseId: number) =>{
        setSelectedCourses((prev)=>{
            //create new set from previous selections
            const updated = new Set(prev[lectId] || []);
            
            //if the course is already in the Set, remove it or vice-versa
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

    //handler to perform assign courses mutation
    const handleAssign = async() =>{
        //array to hold promises of assign mutation
        const assignToDo: Promise<FetchResult<QueryData>>[] = [];
        //array to hold lecturers with no courses assigned
        const lectWithNoAssign : User[]= [];

        lecturers.forEach(lect=>{
            const coursesForLect = Array.from(selectedCourses[lect.id] || []);
            if(coursesForLect.length<1){
                //if no courses are selected, move lecturer to the no assign list
                lectWithNoAssign.push(lect);
            }else{
                //else add it to the promise array
                assignToDo.push(
                    assignLect({variables: {userId: lect.id, courseIds: coursesForLect}}))
            }
        });
        //show toast error for lect with no assignments of courses
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

    //handler to go back to the list view
    const handleBack = () =>{
        setView('list');
        //Re-initialize selectedCourses to reflect current assignments if user goes back
        const initialSelections: Record<number, Set<number>> = {};
        lecturers.forEach(lect=>{
            initialSelections[lect.id] = new Set(lect.assignedCourses.map((c)=>c.courseID));
         }) 
         setSelectedCourses(initialSelections);
    };

    //helper to display assigned courses for the lecturers
    const DisplayAssignedCourses = (lecturer: User) => {
        const assignedCourses = lecturer.assignedCourses
        .map(ac=>courses.find(c=>c.courseID === ac.courseID))    //map assigned courses' IDs to course objects 
        .filter(Boolean) //and filter any undefined values if course not found
        .map(c=> `${c!.courseCode} ${c?.courseName} (Sem ${c?.semester})`); //format string for course display

        //render either list of assigned courses or 'No Courses Assigned'
        return assignedCourses.length > 0 ? 
        (<VStack align="center" spacing={1}>
            {assignedCourses.map((course, index)=>(
                <Text key={index} fontWeight="semibold" fontSize="md" color="blue.700">
                    {course}
                </Text>
            ))}
        </VStack>
        ):(<Text fontSize="sm" color="gray.300">No Courses Assigned</Text>);
    };

    //Display loading/error messages
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

    //redner 'list' view
    if(view==='list'){
        return(
            <Box bgGradient="linear(to-br, blue.600, black)" minH="100vh" px={[4, 6, 12]} py={20}>
            <Box maxW="6xl" mx="auto">
            <Heading mb={2} textAlign="center" color="white" fontSize="3xl" py="10">
             Assign Lecturers To Courses
            </Heading>

            <Card 
            bg="white" 
            borderRadius="lg" 
            shadow="lg"
            transition = "all 0.3s ease-in-out"
            _hover={{
                transform: "scale(1.02)", boxShadow: "xl"
            }}
            >
            <CardBody p={6}>
            <VStack spacing={8} align="stretch">
               <TableContainer>
                <Table  variant="striped" colorScheme="gray">
                    <Thead bg="gray.100">
                        <Tr>
                            <Th textAlign="center">Lecturers</Th>
                            <Th textAlign="center">Email</Th>
                            <Th textAlign="center">Courses Assigned</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                    {lecturers.map((lect)=>(
                        <Tr key={lect.id}>
                            <Td>
                                <VStack align="center" spacing={1}>
                                    <Text fontWeight="semibold" fontSize="md" color="blue.700">
                                        {lect.firstName} {lect.lastName}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                    Joined: {new Date(Number(lect.dateOfJoining)).toLocaleDateString()}
                                    </Text>
                                </VStack>
                            </Td>
                            <Td>
                                <Text fontWeight="semibold" fontSize="md" color="blue.700" textAlign="center">
                                    {lect.email}
                                </Text>
                            </Td>
                            <Td>
                                <Text fontSize="md">
                                    {DisplayAssignedCourses(lect)}
                                </Text>
                            </Td>
                        </Tr>
                    ))}
                    </Tbody>
                </Table>
               </TableContainer>
               <Flex justify="center">
                    <Button
                    px={5}
                    py={2}
                    rounded="full"
                    fontWeight="semibold"
                    fontSize="sm"
                    border="1px solid"
                    bg="blue.600"
                    color="white"
                    borderColor="blue.300"
                    _hover={{
                        bg:"blue.700",
                        color:"white",
                        boxShadow:"0 0 10px rgba(173, 216, 230, 0.6)",
                    }}
                    onClick={handleSelectCourses}
                    
                    >
                     Assign Courses   
                    </Button>
               </Flex>
            </VStack>
            </CardBody>
            </Card>        
            </Box>
            </Box>
        );
    }

//render 'edit' view
    return(
       <Box bgGradient="linear(to-br, blue.600, black)" minH="100vh" px={[4, 6, 12]} py={16}>
        <Box maxW="9xl" mx="auto">
            <Heading textAlign="center" color="white" fontSize="3xl" mt={2} mb={8}>
             Assign Lectures To Courses
        </Heading>
           <Card 
            bg="white" 
            borderRadius="lg" 
            shadow="lg"
            transition = "all 0.3s ease-in-out"
            _hover={{
                transform: "scale(1.02)", boxShadow: "xl"
            }}
            >
            <CardBody p={6}>
                <Container maxW="9xl">
                    <HStack mb={6} justify="space-between">
                        <Button
                        px={5}
                        py={2}
                        rounded="full"
                        fontWeight="semibold"
                        fontSize="sm"
                        border="1px solid"
                        bg="blue.600"
                        color="white"
                        borderColor="blue.300"
                        _hover={{
                            bg:"blue.700",
                            color:"white",
                            boxShadow:"0 0 10px rgba(173, 216, 230, 0.6)",
                        }}
                        onClick={handleBack}
                        >
                        Back
                        </Button>

                        <Button
                        px={5}
                        py={2}
                        rounded="full"
                        fontWeight="semibold"
                        fontSize="sm"
                        border="1px solid"
                        bg="blue.600"
                        color="white"
                        borderColor="blue.300"
                        transition="all 0.2s ease-in-out"
                        _hover={{
                            bg:"blue.700",
                            color:"white",
                            boxShadow:"0 0 10px rgba(173, 216, 230, 0.6)",
                            transform: "scale(1.05)"

                        }}
                        onClick={handleAssign}
                        >
                        Assign Courses
                        </Button>
                       
                    </HStack>

                    <TableContainer>
                        <Table variant="striped" colorScheme="gray">
                            <Thead bg="gray.100">
                                <Tr>
                                    <Th fontSize="md" textAlign="center">Courses / Lecturers</Th>
                                    {lecturers.map((lect)=>(
                                        <Th key={lect.id} textAlign="center" minW="120px" textTransform="none">
                                            <VStack spacing={1}>
                                                <Text fontSize="sm" fontWeight="bold" color="blue.700" textTransform="uppercase">
                                                    {lect.firstName} {lect.lastName}
                                                </Text>
                                                <Text fontSize="sm" color="blue.700">
                                                {lect.email}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                Joined: {new Date(Number(lect.dateOfJoining)).toLocaleDateString()}
                                                </Text>
                                            </VStack>
                                        </Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {courses.map((course)=>(
                                    <Tr key ={course.courseID}>
                                     <Td>
                                        <VStack align="center" spacing={1}>
                                            <Text fontWeight="bold" fontSize="md" color="blue.700">
                                               {course.courseCode} - {course.courseName}
                                            </Text>
                                            <Badge 
                                                size="xs"
                                                colorScheme={
                                                    course.semester === "1"?'yellow' : course.semester === "2"? 'green' : 'blue'
                                                }
                                                variant="subtle"
                                                >Semester {course.semester}
                                            </Badge>
                                            
                                        </VStack>
                                    </Td>   
                                    {lecturers.map((lect)=>(
                                        <Td 
                                        key={lect.id} textAlign="center">
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
                </Container>
            </CardBody>
            </Card>
            </Box>
        </Box>
    );
}

