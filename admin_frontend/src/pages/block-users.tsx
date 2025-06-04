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
    Switch
} from "@chakra-ui/react";

const GET_ALL_USERS = gql `
query GetAllUsers{
 getAllUsers{
    id
    firstName
    lastName
    email
    isBlocked
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
}

const BlockUsers : React.FC = () => {
    const {loading, error, data, refetch} = useQuery(GET_ALL_USERS);
    const [blockUser] = useMutation(BLOCK_USER);

    const handleToggleBlock = async(userId: number, currentStatus: boolean)=>{
        try{
            await blockUser({
                variables: {userId: userId, isBlocked: !currentStatus},
            });
            refetch();
            
        }catch(error){
            console.error("Failed to update block status ", error);
        }
    };

    if(loading)
        return <Spinner />;
    if(error)
        return <Text color="red.500">Error Loading Users</Text>

    return (
        <Box p={6}>
            <Text fontSize="2xl" mb={4}>
                Block/Unblock Users
            </Text>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Blocked</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.getAllUsers.map((user: User)=>(
                        <Tr key={user.id}>
                            <Td>{`${user.firstName} ${user.lastName}`}</Td>
                            <Td>{user.email}</Td>
                            <Td>
                                <Switch 
                                colorScheme="red" 
                                isChecked={user.isBlocked} 
                                onChange={()=>handleToggleBlock(user.id, user.isBlocked)}
                                />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}

export default BlockUsers;