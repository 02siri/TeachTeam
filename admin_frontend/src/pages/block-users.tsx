// import React, {useState, useEffect} from "react";
// import {gql, useQuery, useMutation}  from "@apollo/client";
// import {
//     Box,
//     Heading,
//     Text,
//     Spinner,
//     Alert,
//     AlertIcon,
//     SimpleGrid,
//     Switch,
//     Flex,
//     Spacer,
//     VStack,
//     HStack,
//     useToast
// } from "@chakra-ui/react";
// import {FaUserShield, FaUserCheck} from "react-icons/fa";

// const GET_ALL_USERS = gql `
// query GetAllUsers{
//  getAllUsers{
//     id
//     firstName
//     lastName
//     email
//     isBlocked
//     }
// }
// `;

// const BLOCK_USER = gql`
// mutation BlockUsers($userId: ID!, $isBlocked: Boolean){
//     blockUsers(userId: $userId, isBlocked $isBlocked)
// }
// `;

// interface User{
//     id: number;
//     firstName: string;
//     lastName: string;
//     email: string;
//     isBlocked: boolean;
// }

// const BlockUsers : React.FC = () => {
//     const toast = useToast();
//     const {loading, error, data, refetch} = useQuery<{getAllUsers: User[]}(GET_ALL_USERS);
//     const [blockUser, {loading, mutationLoading}] = useMutation(BLOCK_USER);
//     const [users, setUsers] = useState<User[]>([]);

//     useEffect(()=>{
//         if(data && data.getAllUsers){
//             setUsers(data.getAllUsers);
//         }
//     },[data]);

//     const handleToggleBlock = async(userId: string, currentIsBlocked: boolean)=>{
//         try{
//             await blockUser({variables: {userId: userId, isBlocked: !currentIsBlocked,},});

//             setUsers(prev=>
//                 prev.map(user=> user.id === userId ? {...user, isBlocked: !currentIsBlocked} : user)
//             )
//         }
//     }

// }