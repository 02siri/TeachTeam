import { gql, useQuery } from "@apollo/client";
import { Box, Heading, Spinner, Text } from "@chakra-ui/react";

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

const Reports = () => {
  const { data, loading, error } = useQuery<ReportsData>(GET_REPORTS);

  if (loading) return <Spinner size="xl" />;
  if (error) return <Box color="red.500">Error: {error.message}</Box>;

  return (
    <Box px={6} py={8}>
      <Heading mb={4}>Admin Reports</Heading>

      <Box mb={8}>
        <Text fontWeight="bold" mb={2}>Candidates Chosen Per Course:</Text>
        {data?.candidatesChosenPerCourse.map(({ courseName, selectedCandidates }) => (
          <Box key={courseName} mt={4}>
            <Text fontSize="lg" fontWeight="semibold" color="blue.600">{courseName}</Text>
            <ul>
              {selectedCandidates.map(candidate => (
                <li key={candidate.id}>
                  {candidate.firstName} {candidate.lastName} - {candidate.email}
                </li>
              ))}
            </ul>
          </Box>
        ))}
      </Box>

      <Box mb={8}>
        <Text fontWeight="bold" mb={2}>Candidates Chosen for More Than 3 Courses:</Text>
        <ul>
          {data?.candidatesChosenForMoreThanThree.map(candidate => (
            <li key={candidate.id}>
              {candidate.firstName} {candidate.lastName} - {candidate.email}
            </li>
          ))}
        </ul>
      </Box>

      <Box>
        <Text fontWeight="bold" mb={2}>Candidates Not Chosen for Any Course:</Text>
        <ul>
          {data?.candidatesNotChosen.map(candidate => (
            <li key={candidate.id}>
              {candidate.firstName} {candidate.lastName} - {candidate.email}
            </li>
          ))}
        </ul>
      </Box>
    </Box>
  );
};

export default Reports;
