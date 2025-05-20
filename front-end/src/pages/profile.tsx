import { useEffect, useState } from "react";
import{ Box, Button, Flex, Grid, GridItem, Text, useToast} from "@chakra-ui/react";
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

//defining menu items for profile
const profileMenuItems = ["Personal Details", "Application Details", "Qualifications & Skills"] as const;
type ProfileMenuKey = typeof profileMenuItems[number];

//component for profile menu
interface ProfileHeaderProps{
activeMenu : ProfileMenuKey;
onMenuChange: (menu: ProfileMenuKey) => void;
tutorData: TutorData | null;
}

const ProfileHeader : React.FC<ProfileHeaderProps> = ({activeMenu, onMenuChange, tutorData}) => (
    <Flex p={4} boxShadow = "sm" justify ="space-around" mb={4}>
        {profileMenuItems.map((item)=>(
            <Button 
            key={item} 
            variant = {activeMenu === item ? "solid" : "ghost"}
            colorScheme="blue"
            onClick={()=> onMenuChange(item)}
            isDisabled = {item === "Application Details" && !tutorData}>
            {item}
            </Button>
        ))}
    </Flex>
);

const Profile = () => {
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [tutorData, setTutorData] = useState<TutorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [activeMenu, setActiveMenu] = useState<ProfileMenuKey>("Personal Details");
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const renderActiveProfileSection = () => {

    const sectionStyle = {
        borderWidth: "1px",
        borderRadius: "md",
        p: 6
    };

    const labelStyle = {
        fontWeight : "bold",
        fontSize: "xl",
        mb: 1,
    };

    switch(activeMenu){
        case "Personal Details":
            return (
            <Box {...sectionStyle}>
                <Grid templateColumns = "repeat(2, 1fr)" gap ={4}>
                    <GridItem>
                        <Text {...labelStyle}>First Name: </Text>
                         <Box 
                            width = "50%"
                            border="1px" 
                            borderRadius="md" 
                            p={2}
                            background="blue.500"
                            textColor="white"
                            fontWeight="bold"
                        >
                            <Text fontSize="lg">{profileData.firstName}</Text>
                        </Box>
                    </GridItem>

                    <GridItem>

                        <Text {...labelStyle}>Last Name: </Text>
                         <Box 
                           width = "50%"
                            border="1px" 
                            borderRadius="md" 
                            p={2}
                            background="blue.500"
                            textColor="white"
                            fontWeight="bold"
                        >
                             <Text fontSize="lg">{profileData.lastName}</Text>
                        </Box>
                     
                    </GridItem>

                    <GridItem>
                        <Text {...labelStyle}>Email: </Text>
                        <Box 
                           width = "50%"
                            border="1px" 
                            borderRadius="md" 
                            p={2}
                            background="blue.500"
                            textColor="white"
                            fontWeight="bold"
                        >
                             <Text fontSize="lg">{profileData.email}</Text>
                        </Box>
                        
                    </GridItem>

                    <GridItem>
                        <Text {...labelStyle}>Username: </Text>
                        <Box 
                           width = "50%"
                            border="1px" 
                            borderRadius="md" 
                            p={2}
                            background="blue.500"
                            textColor="white"
                            fontWeight="bold"
                        >
                             <Text fontSize="lg">{profileData.username}</Text>
                        </Box>
                    </GridItem>

                    <GridItem>
                        <Text {...labelStyle }>Date of Joining </Text>
                            <Box 
                           width = "50%"
                            border="1px" 
                            borderRadius="md" 
                            p={2}
                            background="blue.500"
                            textColor="white"
                            fontWeight="bold"
                            >
                             <Text fontSize="lg">{new Date(profileData.dateOfJoining).toLocaleDateString()}</Text>
                        </Box>
                        
                    </GridItem>
                </Grid>
            </Box>
        );
        case "Application Details":
            return tutorData? (
            <Box {...sectionStyle}>

                 <Grid templateColumns = "repeat(2, 1fr)" gap ={4}>

                    <GridItem>
                    <Text fontWeight="bold">Role Applied:</Text>
                    <Text>{tutorData.sessionType}</Text>
                    </GridItem>

                    <GridItem>
                    <Text fontWeight="bold">Availability:</Text>
                    <Text>{tutorData.availability}</Text>
                    </GridItem>

                    <GridItem colSpan={1}>
                    <Text fontWeight="bold">Courses Applied:</Text>
                    <Box pl={2}>
                        {tutorData.courses.map((course, index)=>(
                            <Text key ={index}> -{course.courseCode} {course.courseName} </Text>
                        ))}
                    </Box>
                    </GridItem>

                    <GridItem colSpan={1}>
                    <Text fontWeight="bold">Previous Roles:</Text>
                    <Box pl={2}>
                        {tutorData.previousRoles.map((role, index)=>(
                            <Text key ={index}> -{role}</Text>
                        ))}
                    </Box>
                    </GridItem>
                </Grid>
        </Box>
        ):(
            <Box p={4}>
                No Tutor Application Details found.
            </Box>
        );
        case "Qualifications & Skills":
            return tutorData ? (

            <Box {...sectionStyle}>
                 <Grid templateColumns = "repeat(2, 1fr)" gap ={4}>
                    <GridItem colSpan={2}>
                        <Text fontWeight="bold">Academic Credentials:</Text>
                        <Box pl={4}>
                            {tutorData.user?.credentials.length ? (
                                tutorData.user?.credentials.map((cred, index) => (
                                    <Text key = {index}>- {cred.qualification} from {cred.institution} ({cred.year}) </Text>
                                ))
                            ):
                            (
                                <Text>No Credentials Submitted</Text>
                            )
                            }
                        </Box>
                    </GridItem>

                    <GridItem colSpan={2}>
                     <Text fontWeight="bold">Skills:</Text>
                     <Text>{(tutorData.user?.skills??[]).map(skill => skill.skillName).join(",")}</Text>
                    </GridItem>
                 </Grid>
            </Box>
            ) : (
                <Text>No Qualifications and Skills found.</Text>  
        );
    default:
        return null;
    }
};

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
    transition={{ duration: 0.5 }}
    display="flex"
    justifyContent= "center"
    >
   
   {/* Profile Box */}
    <Box
     width = "100%"
     bg="whiteAlpha.900"
     borderRadius="md"
     boxShadow="md"
     p={8}
     >
        <Text fontSize="3xl" fontWeight="bold" color="blue.700" mb={6} align="center">
            Your Profile
        </Text>
 
        {/* Passing tutor data as a prop */}
        <ProfileHeader activeMenu={activeMenu} onMenuChange={setActiveMenu} tutorData={tutorData} />

        {renderActiveProfileSection()}
    </Box>

    </MotionBox>
    <Footer />
    </>
);
};

export default Profile;