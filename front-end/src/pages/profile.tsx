import { useEffect, useState } from "react";
import{ Box, Text, useToast} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { userApi, tutorApi } from "@/services/api";
import { useAuth } from "@/context/AuthLogic";
import { AxiosError } from "axios";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

interface TutorData{
    sessionType: string[];
    courses: {courseID: number; courseCode: string; courseName: string; semester: string; description: string}[];
    previousRoles: string[];
    availability: string;
    timestamp: string;
    user?:{
      skills: {skillId: number; skillName: string}[];
      credentials : {credentialId: number; qualification: string; institution : string; year: number}[];
    };
}

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
    const [tutorData, setTutorData] = useState<TutorData | null>(null);
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
                const userRes = await userApi.getUserByEmail(currentUserEmail);
                setProfileData(userRes);

                try{
                    const tutorRes = await tutorApi.getApplicationByEmail(currentUserEmail);
                    setTutorData(tutorRes);
                }catch(tutorError){
                    console.warn("Tutor Application not found or failed to fetch");
                }

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

    {tutorData && (
    <Box>
        <Text fontSize="3xl" fontWeight="bold" color="white" align="center">
                Tutor Application Details
        </Text>
       
        <Box borderWidth="1px" borderRadius="md" p={6} background="gray.200">
            <Text fontWeight="bold" mb={2}>
                Roles: 
                    <Text as="span" fontWeight="normal">{tutorData.sessionType}</Text>
            </Text>

            <Text fontWeight="bold" mb={2}>
                Courses: 
                     <Box pl = {4}>
                    {Array.isArray(tutorData.courses) && tutorData.courses.length > 0 ? (
                        tutorData.courses.map((courses,index) => (
                        <Text key = {index} fontSize= "sm" mb={1}>
                            - {courses.courseCode} {courses.courseName}
                        </Text>
                    ))
                ): (
                        <Text fontSize="sm">No Credentials Submitted</Text>
                    )}
                 </Box>
            </Text>

            <Text fontWeight="bold" mb={2}>
                Previous Roles: 
                    <Text as="span" fontWeight="normal">{tutorData.previousRoles.join(",")}</Text>
            </Text>
 
            <Text fontWeight="bold" mb={2}>
                Availability:
                    <Text as="span" fontWeight="normal">{tutorData.availability}</Text>
            </Text>

            <Text fontWeight="bold" mb={2}>
                Skills:
                    <Text as="span" fontWeight="normal">{(tutorData.user?.skills??[]).map(skill => skill.skillName).join(",")}</Text>
            </Text>

            <Text fontWeight="bold" mb={2}>
                Academic Credentials:
                 <Box pl = {4}>
                    {Array.isArray(tutorData.user?.credentials) && tutorData.user?.credentials.length > 0 ? (
                        tutorData.user?.credentials.map((cred,index) => (
                        <Text key = {index} fontSize= "sm" mb={1}>
                            - {cred.qualification} from {cred.institution} ({cred.year})
                        </Text>
                    ))
                ): (
                        <Text fontSize="sm">No Credentials Submitted</Text>
                    )}
                 </Box>
            </Text>

            <Text fontWeight="bold" mb={2}>
                Submitted On:
                   {new Date(tutorData.timestamp).toLocaleString()}
            </Text>


        </Box>

    </Box>
    )}
    </MotionBox>
    <Footer />
    </>
);
};

export default Profile;