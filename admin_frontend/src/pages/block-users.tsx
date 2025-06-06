import {gql, useQuery, useMutation}  from "@apollo/client";
import {
    Box,
    Text,
    Spinner,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Switch,
    useToast,
    Flex,
    Heading,
    VStack,
    Card,
    CardBody
} from "@chakra-ui/react";

const GET_ALL_USERS = gql `
query GetAllUsers{
 getAllUsers{
    id
    firstName
    lastName
    email
    isBlocked
    dateOfJoining
    }
}
`;

const BLOCK_USER = gql`
mutation BlockUsers($userId: ID!, $isBlocked: Boolean!){
    blockUsers(userId: $userId, isBlocked: $isBlocked)
}
`;

interface User{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isBlocked: boolean;
    dateOfJoining: string;
}

const BlockUsers : React.FC = () => {
    const {loading, error, data, refetch} = useQuery(GET_ALL_USERS);
    const [blockUser] = useMutation(BLOCK_USER);
    const toast = useToast();

    const handleToggleBlock = async(userId: number, currentStatus: boolean)=>{
        try{
            await blockUser({
                variables: {userId: userId, isBlocked: !currentStatus},
            });
            toast({
                title: currentStatus? "User Unblocked" : "User Blocked",
                status: currentStatus ? "info" : "warning",
                duration: 3000,
                isClosable: true,
            })
            refetch();
            
        }catch(error){
            console.error("Failed to update block status ", error);
            toast({
                title: "Error updating user status",
                description: (error as Error).message,
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    };

    //Filter out admin user
    const filteredUsers = data?.getAllUsers?.filter((user:User)=>
    user.firstName!=="Admin" || user.email !=="admin"
    )  || [];

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
    return (
       <Box bgGradient="linear(to-br, blue.600, black)" minH="100vh" px={[4, 6, 12]} py={20}>
         <Box maxW="6xl" mx="auto">
        <Heading mb={2} textAlign="center" color="white" fontSize="3xl" py="10">
                     Block/Unblock Users
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
           
            <Table variant="striped" colorScheme="gray">
                <Thead bg="gray.100">
                    <Tr>
                        <Th textAlign="center">Name</Th>
                        <Th textAlign="center">Email</Th>
                        <Th textAlign="center">Date Joined</Th>
                        <Th textAlign="center">Blocked</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {filteredUsers.map((user: User)=>(
                        <Tr key={user.id}>
                            <Td textAlign="center" fontSize="md" fontWeight="semibold" color="blue.700">{`${user.firstName} ${user.lastName}`}</Td>
                            <Td textAlign="center" fontSize="md" fontWeight="semibold" color="blue.700">{user.email}</Td>
                            <Td textAlign="center" fontSize="md" fontWeight="semibold" color="blue.700">{new Date(Number(user.dateOfJoining)).toLocaleDateString()}</Td>
                            <Td>
                                <Flex justify="center">
                                <Switch 
                                size="md"
                                colorScheme="red" 
                                isChecked={user.isBlocked} 
                                onChange={()=>handleToggleBlock(user.id, user.isBlocked)}
                                />
                                </Flex>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            </VStack>
            </CardBody>
            </Card>
            </Box>
        </Box>
    );
}

export default BlockUsers;