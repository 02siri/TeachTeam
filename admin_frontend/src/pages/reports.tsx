import { gql, useQuery } from "@apollo/client";
import {
  Box,
  Heading,
  Spinner,
  Text,
  Divider,
  Flex,
  Icon,
  SimpleGrid,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiUser } from "react-icons/fi";

const GET_REPORTS = gql`
  query {
    candidatesChosenPerCourse {
      courseName
      selectedCandidates {
        id
        firstName
        lastName
        email
        dateOfJoining
        appliedCourses {
          courseName
          isSelected
        }
      }
    }
    candidatesChosenForMoreThanThree {
      id
      firstName
      lastName
      email
      dateOfJoining
      appliedCourses {
        courseName
        isSelected
      }
    }
    candidatesNotChosen {
      id
      firstName
      lastName
      email
      dateOfJoining
      appliedCourses {
        courseName
        isSelected
      }
    }
  }
`;




type AppliedCourse = {
  courseName: string;
  isSelected: boolean;
};

type Candidate = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfJoining: string;
  appliedCourses?: AppliedCourse[];
};

type CandidatesPerCourse = {
  courseName: string;
  selectedCandidates: Candidate[];
};

type ReportsData = {
  candidatesChosenPerCourse: CandidatesPerCourse[];
  candidatesChosenForMoreThanThree: Candidate[];
  candidatesNotChosen: Candidate[];
};





//I am reusing this candidate card for 3 reports..
const CandidateCard = ({
  candidate,
  hideCourses = false,
}: {
  candidate: Candidate;
  hideCourses?: boolean;
}) => (
  <Flex
    align="start"
    bg="gray.50"
    px={4}
    py={3}
    rounded="md"
    shadow="base"
    border="1px solid"
    borderColor="gray.200"
    direction="column"
    gap={2}
  >
    <Flex align="center">
      <Icon 
      as={FiUser} 
      mr={2} 
      color="blue.500" 
      fontSize="xl" 
      />
      <Box>
        <Text fontWeight="medium">
          {candidate.firstName} {candidate.lastName}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {candidate.email}
        </Text>
      </Box>
    </Flex>
    <Text fontSize="xs" color="gray.500">
      Joined: {new Date(Number(candidate.dateOfJoining)).toLocaleDateString()}
    </Text>
    {!hideCourses && candidate.appliedCourses && candidate.appliedCourses.length > 0 && (
      <Box mt={2}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
          Applied Courses:
        </Text>
        {candidate.appliedCourses.map((course, idx) => (
          <Text
            key={idx}
            fontSize="xs"
            color={course.isSelected ? "green.600" : "red.500"}
          >
            • {course.courseName} {course.isSelected ? "(Accepted)" : "(Not Selected)"}
          </Text>
        ))}
      </Box>
    )}
  </Flex>
);







//overall report organising..
const SectionBox = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box
    mb={12}
    p={6}
    bg="white"
    rounded="2xl"
    shadow="md"
    border="1px solid"
    borderColor="gray.200"
    transition="all 0.3s ease-in-out"
    _hover={{ boxShadow: "xl", transform: "scale(1.01)" }}
  >
    <Heading fontSize="xl" mb={4} color="blue.800" textAlign="center">
      {title}
    </Heading>
    <Divider mb={4} />
    {children}
  </Box>
);








//here is the main component for report page...
const Reports = () => {
  const { data, loading, error } = useQuery<ReportsData>(GET_REPORTS);
  const [activeReport, setActiveReport] = useState<
    "perCourse" | "moreThanThree" | "notChosen"
  >("perCourse");

  if (loading) return <Spinner size="xl" mt={10} color="white" />;
  if (error) return <Box color="red.500">Error: {error.message}</Box>;

  return (
    <Box 
    bgGradient="linear(to-br, blue.600, black)" 
    minH="100vh"
    px={[4, 6, 12]} 
    py={16}
    >

      <Box 
      maxW="6xl" 
      mx="auto"
      >
        <Heading textAlign="center" color="white" fontSize="3xl" mt={4} mb={8}>
          Admin Reports Dashboard
        </Heading>

        <Card
          bg="white"
          shadow="lg"
          borderRadius="2xl"
          transition="0.3s"
          _hover={{ transform: "scale(1.02)", boxShadow: "xl" }}
        >
          <CardHeader 
          borderBottom="1px solid" 
          borderColor="gray.200"
          >

            <ButtonGroup 
            display="flex" 
            justifyContent="center" 
            gap={4} 
            flexWrap="wrap"
            >
              {["perCourse", "moreThanThree", "notChosen"].map((key) => (
                <Button
                  key={key}
                  px={5}
                  py={2}
                  rounded="full"
                  fontWeight="semibold"
                  fontSize="sm"
                  border="1px solid"
                  onClick={() => setActiveReport(key as typeof activeReport)}
                  bg={activeReport === key ? "blue.600" : "gray.100"}
                  color={activeReport === key ? "blue.100" : "gray.800"}
                  borderColor={activeReport === key ? "blue.300" : "gray.300"}
                  _hover={{
                    bg: activeReport === key ? "blue.700" : "gray.200",
                    color: activeReport === key ? "white" : "blue.600",
                    boxShadow: "0 0 10px rgba(173, 216, 230, 0.6)",
                  }}
                >
                  {key === "perCourse"
                    ? "Candidates Per Course"
                    : key === "moreThanThree"
                    ? "More Than 3 Courses"
                    : "Not Chosen"}
                </Button>
              ))}
            </ButtonGroup>
          </CardHeader>

          <CardBody>


            {activeReport === "perCourse" && (
              <SectionBox title="Candidates Chosen Per Course">
                <SimpleGrid columns={[1, 2]} spacing={6}>
                  {data?.candidatesChosenPerCourse.map(({ courseName, selectedCandidates }) => (
                    <Box
                      key={courseName}
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.300"
                      rounded="lg"
                      p={5}
                      shadow="sm"
                      _hover={{ shadow: "md", transform: "scale(1.01)", transition: "all 0.2s" }}
                    >
                      <Text fontSize="md" fontWeight="bold" color="blue.700" mb={3}>
                        {courseName} — {selectedCandidates.length} candidate(s)
                      </Text>
                      <SimpleGrid columns={[1]} spacing={4}>
                        {selectedCandidates.map((c) => (
                          <CandidateCard key={c.id} candidate={c} hideCourses />
                        ))}
                      </SimpleGrid>
                    </Box>
                  ))}
                </SimpleGrid>
              </SectionBox>
            )}


            {activeReport === "moreThanThree" && (
              <SectionBox title="Candidates Chosen for More Than 3 Courses">
                {data?.candidatesChosenForMoreThanThree.length ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                    {data.candidatesChosenForMoreThanThree.map((candidate) => (
                      <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Flex justify="center" align="center" py={10}>
                    <Text fontSize="md" color="gray.500">
                      No candidates found for this report.
                    </Text>
                  </Flex>
                )}
              </SectionBox>
            )}



            {activeReport === "notChosen" && (
              <SectionBox title="Candidates Not Chosen for Any Course">
                {data?.candidatesNotChosen.length ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                    {data.candidatesNotChosen.map((candidate) => (
                      <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Flex justify="center" align="center" py={10}>
                    <Text fontSize="md" color="gray.500">
                      No candidates found for this report.
                    </Text>
                  </Flex>
                )}
              </SectionBox>
            )}
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default Reports;
