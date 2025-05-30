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
} from "@chakra-ui/react";
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
      }
    }
    candidatesChosenForMoreThanThree {
      id
      firstName
      lastName
      email
    }
    candidatesNotChosen {
      id
      firstName
      lastName
      email
    }
  }
`;

type Candidate = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
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

const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
  <Flex
    align="center"
    bg="gray.50"
    px={4}
    py={3}
    rounded="md"
    shadow="base"
    border="1px solid"
    borderColor="gray.200"
    mb={2}
  >
    <Icon as={FiUser} mr={4} color="blue.500" fontSize="xl" />
    <Box>
      <Text fontWeight="medium" fontSize="md">
        {candidate.firstName} {candidate.lastName}
      </Text>
      <Text fontSize="sm" color="gray.600">
        {candidate.email}
      </Text>
    </Box>
  </Flex>
);

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
    rounded="xl"
    shadow="md"
    border="1px solid"
    borderColor="gray.200"
  >
    <Heading fontSize="xl" mb={4} color="blue.800">
      {title}
    </Heading>
    <Divider mb={4} />
    {children}
  </Box>
);

const Reports = () => {
  const { data, loading, error } = useQuery<ReportsData>(GET_REPORTS);

  if (loading) return <Spinner size="xl" mt={10} />;
  if (error) return <Box color="red.500">Error: {error.message}</Box>;

  return (
    <Box
    bgGradient="linear(to-br, blue.600, black)"
    minH="100vh"
    px={[4, 6, 12]}
    py={16}
  >


    <Box px={6} py={10} maxW="6xl" mx="auto" >
      <Heading mb={4} textAlign="center" textColor={"white"} fontSize="3xl" fontWeight="bold">
        Admin Reports Dashboard
      </Heading>

      
      <SectionBox title="Candidates Chosen Per Course">
        {data?.candidatesChosenPerCourse.map(({ courseName, selectedCandidates }) => {
          const namesList = selectedCandidates
          .map((c) => `${c.firstName} ${c.lastName}`)
          .join(", ");
          
          return (
          <Box key={courseName} mb={8}>
            
            <Text fontSize="lg" fontWeight="semibold" color="blue.700" mb={1}>
              {courseName} - {selectedCandidates.length} candidate(s)
            </Text>
            
            <Text fontSize="sm" color="gray.600" mb={3}>
              {namesList}
            </Text>
            
            
            <SimpleGrid columns={[1, 2]} spacing={4}>
              {selectedCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
            </SimpleGrid>
            
          </Box>
          );
          })}
        </SectionBox>


      <SectionBox title="Candidates Chosen for More Than 3 Courses">
        {data?.candidatesChosenForMoreThanThree.length ? (

          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {data.candidatesChosenForMoreThanThree.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </SimpleGrid>

        ) : (
          <Text>No candidates found.</Text>
        )}
      </SectionBox>


      
      <SectionBox title="Candidates Not Chosen for Any Course">
        {data?.candidatesNotChosen.length ? (

          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {data.candidatesNotChosen.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </SimpleGrid>
          
        ) : (
          <Text>No candidates found.</Text>
        )}
      </SectionBox>
    </Box>
   </Box>
  );
};

export default Reports;
