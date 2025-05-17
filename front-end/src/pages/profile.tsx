import { useEffect, useState } from "react";
import{ Box, Heading, Text, useToast, VStack} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { userApi } from "@/services/api";
import { useAuth } from "@/context/AuthLogic";
import { AxiosError } from "axios";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

interface UserProfile{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username : string;
    dateOfJoining: string;
    //intentionally don't want to display passsword for security reasons
}

const MotionBox = motion(Box); 

const Profile = () => {
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const router = useRouter();
    const toast = useToast();
    const {currentUserEmail} = useAuth();

    //Fetch user profile on component mount
    useEffect(()=>{
        const fetchProfile = async() =>{

            if(!currentUserEmail){
                router.push("/login");
                return;
            }

            try{
                const response = await userApi.getUserByEmail(currentUserEmail);
                setProfileData(response);
                setLoading(false);
            }catch(error){
                 const axiosError = error as AxiosError<{message: string}>;
                 if(axiosError.response){
                setError(axiosError.response.data?.message || "Failed to fetch Profile Data.");
                setLoading(false);
                }
                console.log("Error fetching profile", error);
                toast({
                    title: "Error",
                    description: "Failed to load Profile",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        fetchProfile();
    }, [currentUserEmail, router, toast]);

    if(loading){
        return <Box>Loading Profile...</Box>
    }

    if(error){
        return <Box color="red">{error}</Box>
    }

    if(!profileData){
        return <Box>No Profile Data available</Box>
    }

return(
    <>
    <Header />   

    {/*Background Container */}
     <MotionBox 
    p={20} 
    bgGradient="linear(to-br, blue.600, black)" 
    minH="100vh" 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.5 }}>

    {/*Form Container */}
    <Box>

    
        <Text fontSize="3xl" fontWeight="bold" color="white" align="center">
            Your Profile
       </Text>
        <Box borderWidth="1px" borderRadius="md" p={6} background="gray.200">
            <Text fontWeight="bold" mb={2}>
                First Name: 
                    <Text as="span" fontWeight="normal">{profileData.firstName}</Text>
            </Text>

            <Text fontWeight="bold" mb={2}>
                Last Name: 
                    <Text as="span" fontWeight="normal">{profileData.lastName}</Text>
            </Text>

            <Text fontWeight="bold" mb={2}>
                Email: 
                    <Text as="span" fontWeight="normal">{profileData.email}</Text>
            </Text>

            <Text fontWeight="bold" mb={2}>
                Username: 
                    <Text as="span" fontWeight="normal">{profileData.username}</Text>
            </Text>
            <Text fontWeight="bold" mb={2}>
                Date of Joining: 
                    <Text as="span" fontWeight="normal">{new Date(profileData.dateOfJoining).toLocaleDateString()}</Text>
            </Text>

            <Text mt={4} fontSize="sm" color="gray.400">
               For security reasons, password is not displayed.
            </Text>
            
        </Box>
    </Box>
    </MotionBox>
    <Footer />
    </>
);
};

export default Profile;