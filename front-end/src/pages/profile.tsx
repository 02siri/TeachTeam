import { useEffect, useState } from "react";
import{ Box, Button, Flex, Grid, GridItem, Text, useToast} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { userApi, tutorApi } from "@/services/api";
import { useAuth } from "@/context/AuthLogic";
import { AxiosError } from "axios";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Head from "next/head";

interface TutorData{
    sessionType: string[];
    courses: {courseID: number; courseCode: string; courseName: string; semester: string; description: string}[];
    previousRoles: string[];
    availability: string;
    timestamp: string;
    skills: {skillId: number; skillName: string}[];
    academicCredentials : {credentialId: number; qualification: string; institution : string; year: number}[];
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
tutorData: TutorData[];
}

const ProfileHeader : React.FC<ProfileHeaderProps> = ({activeMenu, onMenuChange, tutorData}) => (
    <Flex 
    p={4} 
    boxShadow= "0 0 10px rgba(173, 216, 230, 0.8)" 
    justify ="space-around" 
    mb={4} 
    bg="transparent" 
    borderRadius="md"
    >
    {profileMenuItems.map((item)=>(
    <Button
    key={item}
    variant="ghost"
    colorScheme="blue"
    onClick={() => onMenuChange(item)}
    isDisabled={item === "Application Details" && !tutorData}
    px={4}
    py={2}
    borderRadius="full"
    color={activeMenu === item ? "blue.500" : "blue.700"}
    transition="all 0.3s ease-in-out"
    bg={activeMenu === item ? "blue.50" : "transparent"}
    boxShadow={activeMenu === item ? "0 0 10px rgba(173, 216, 230, 0.8)" : "none"}
    _hover={{
        color: "blue.500",
        boxShadow: "0 0 10px rgba(173, 216, 230, 0.8)",
        bg: "blue.100"
    }}
    _focus={{
        boxShadow: "0 0 10px rgba(173, 216, 230, 0.8)"
    }}
    >
    {item}
</Button>

        ))}
    </Flex>
);

const Profile = () => {
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [activeMenu, setActiveMenu] = useState<ProfileMenuKey>("Personal Details");
    const router = useRouter();
    const toast = useToast();
    const {currentUserEmail} = useAuth();
    const [tutorData, setTutorData] = useState<TutorData[]>([]);


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
                   const normalized = Array.isArray(tutorRes) ? tutorRes : [tutorRes];
                   setTutorData(normalized.map(app => ({
                    ...app,
                    sessionType: Array.isArray(app.sessionType) ? app.sessionType : [app.sessionType]
                })));

                }catch{
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
        p: 6,
        background:"transparent",
        height: "80%",
        boxShadow: "0 0 10px rgba(173, 216, 230, 0.8)",
    };

    const labelStyle = {
        fontSize : "lg",
        fontWeight: "bold",
        color : "black.100",
        pb: 1
    };

     const labelContentStyle = { 
        border: "1px solid", 
        borderColor: "gray.300",
        borderRadius: "md", 
        p: 3, 
        background: "white", 
        textColor: "blue.500",
        fontWeight: "bold",
        width: "100%", 
        _focusWithin: { 
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px #3182CE",
        },
    };

     const DataDisplayItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <GridItem>
            <Flex direction="column" align="center" justify="center">
                <Text {...labelStyle} textAlign="center">{label}</Text>
                <Box {...labelContentStyle}>
                    <Text fontSize="lg" textAlign="center">{children}</Text>
                </Box>
            </Flex>
        </GridItem>
    );

    switch(activeMenu){
        case "Personal Details":
            return (
            <Box {...sectionStyle}>
                <Grid templateColumns = "repeat(2, 1fr)" gap ={4}>
                    {/* <GridItem>
                        <Flex direction="column" align="center" justify="center">
                        <Text {...labelStyle} textAlign="center">First Name</Text>
                         <Box {...labelContentStyle}>
                            <Text fontSize="lg" textAlign="center">{profileData.firstName}</Text>
                        </Box>
                        </Flex> */}
                        <DataDisplayItem label="First Name">
                            {profileData.firstName}
                        </DataDisplayItem>

                        <Box
                        position="absolute"
                        bottom="90px"
                        right="290px"  
                        zIndex="1" // Ensure it's above other content if overlapping
                            // Using dangerouslySetInnerHTML with plain HTML style string
                            dangerouslySetInnerHTML={{
                            __html: `
                            <lord-icon
                            src="https://cdn.lordicon.com/cniwvohj.json"
                            trigger="hover"
                            colors="primary:#66a1ee,secondary:#242424"
                            style="width:300px;height:250px">
                            </lord-icon>
                            `,
                            }}
                        />

                    {/* </GridItem> */}

                    {/* <GridItem>
                        <Flex direction="column" align="center" justify="center">
                        <Text {...labelStyle} textAlign="center">Last Name</Text>
                          <Box {...labelContentStyle}>
                             <Text fontSize="lg" textAlign="center">{profileData.lastName}</Text>
                        </Box>
                     </Flex>
                    </GridItem>

                    <GridItem>
                        <Flex direction="column" align="center" justify="center">
                        <Text {...labelStyle} textAlign="center">Email</Text>
                         <Box {...labelContentStyle}>
                             <Text fontSize="lg" textAlign="center">{profileData.email}</Text>
                        </Box>
                        </Flex>
                    </GridItem>

                    <GridItem>
                        <Flex direction="column" align="center" justify="center">
                        <Text {...labelStyle} textAlign="center">Username</Text>
                         <Box {...labelContentStyle}>
                             <Text fontSize="lg" textAlign="center">{profileData.username}</Text>
                        </Box>
                        </Flex>
                    </GridItem>

                    <GridItem>
                         <Flex direction="column" align="center" justify="center">
                        <Text {...labelStyle } textAlign="center">Date of Joining</Text>
                            <Box {...labelContentStyle}>
                             <Text fontSize="lg" textAlign="center">{new Date(profileData.dateOfJoining).toLocaleDateString()}</Text>
                        </Box>
                        </Flex>
                    </GridItem> */}
                    <DataDisplayItem label="Last Name">
                        {profileData.lastName}
                    </DataDisplayItem>

                    <DataDisplayItem label="Email">
                        {profileData.email}
                    </DataDisplayItem>

                    <DataDisplayItem label="Username">
                        {profileData.username}
                    </DataDisplayItem>

                    <DataDisplayItem label="Date of Joining">
                        {new Date(profileData.dateOfJoining).toLocaleDateString()}
                    </DataDisplayItem>
                </Grid>
            </Box>
        );
        case "Application Details":
            return tutorData.length > 0 ? (
            <Box {...sectionStyle}>
                {tutorData.map((app, i) => (
                    <Box key={i} border="1px solid #CBD5E0" p={4} borderRadius="md" mb={4} bg="gray.50">
                        <Text fontSize="lg" fontWeight="bold" mb={2} color="blue.600">
                            Application {i + 1}: {" "}{
                                app.sessionType
                                .map((type)=>(type === "tutor" ? "Tutor" : type === "lab" ? "Lab Assistant": type))
                            }
                        </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    {/* <GridItem>
                        <Text fontWeight="bold">Availability:</Text>
                        <Text>{app.availability}</Text>
                    </GridItem>
                    
                    <GridItem>
                        <Text fontWeight="bold">Submitted:</Text>
                        <Text>{new Date(app.timestamp).toLocaleString()}</Text>
                    </GridItem>
                    
                    <GridItem colSpan={2}>
                        <Text fontWeight="bold" mt={2}>Courses Applied:</Text>
                        <Box pl={4}>
                        {app.courses.map((course, idx) => (
                            <Text key={idx}>- {course.courseCode} {course.courseName}</Text>
                            ))}
                        </Box>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <Text fontWeight="bold" mt={2}>Previous Roles:</Text>
                        <Box pl={4}>
                            {app.previousRoles.map((role, idx) => (
                                <Text key={idx}>- {role}</Text>
                                ))}
                        </Box>
                    </GridItem> */}
                     <DataDisplayItem label="Availability">
                        {app.availability}
                    </DataDisplayItem>

                    <DataDisplayItem label="Submitted">
                        {new Date(app.timestamp).toLocaleString()}
                    </DataDisplayItem>

                    <GridItem colSpan={2}>
                        <DataDisplayItem label="Courses Applied">
                            {app.courses.length > 0 ? (
                                <Box pl={4}>
                                    {app.courses.map((course, idx) => (
                                        <Text key={idx}>- {course.courseCode} {course.courseName}</Text>
                                    ))}
                                </Box>
                            ) : (
                                <Text>No courses applied.</Text>
                            )}
                        </DataDisplayItem>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <DataDisplayItem label="Previous Roles">
                            {app.previousRoles.length > 0 ? (
                                <Box pl={4}>
                                    {app.previousRoles.map((role, idx) => (
                                        <Text key={idx}>- {role}</Text>
                                    ))}
                                </Box>
                            ) : (
                                <Text>No previous roles.</Text>
                            )}
                        </DataDisplayItem>
                    </GridItem>
                </Grid>
            </Box>
         ))}
         </Box>
         ) : (
         <Box p={4}>No Tutor Application Details found.</Box>
        );

        case "Qualifications & Skills":
            return tutorData.length > 0 ? (
            <Box {...sectionStyle}>
                {tutorData.map((app, i) => (
                    <Box key={i} border="1px solid #CBD5E0" p={4} borderRadius="md" mb={4} bg="gray.50">
                        <Text fontSize="lg" fontWeight="bold" mb={2} color="blue.600">
                            Application {i + 1}: {" "}{
                                app.sessionType
                                .map((type)=>(type === "tutor" ? "Tutor" : type === "lab" ? "Lab Assistant": type))
                            }
                        </Text>
                        
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <GridItem colSpan={2}>
                                {/* <Text fontWeight="bold">Academic Credentials:</Text>
                                <Box pl={4}>
                                    {app.academicCredentials?.length ? (
                                        app.academicCredentials.map((cred, index) => (
                                        <Text key={index}>
                                            - {cred.qualification} from {cred.institution} ({cred.year})
                                        </Text>
                                        ))
                                    ) : (
                                <Text>No Credentials Submitted</Text>
                            )}
                        </Box>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <Text fontWeight="bold">Skills:</Text>
                        <Text>{app.skills?.map((s) => s.skillName).join(", ") || "No Skills Submitted"}</Text> */}
                         <DataDisplayItem label="Academic Credentials">
                                    {app.academicCredentials?.length ? (
                                        <Box pl={4}>
                                            {app.academicCredentials.map((cred, index) => (
                                            <Text key={index}>
                                                - {cred.qualification} from {cred.institution} ({cred.year})
                                            </Text>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Text>No Credentials Submitted</Text>
                                    )}
                                </DataDisplayItem>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <DataDisplayItem label="Skills">
                                    <Text>{app.skills?.map((s) => s.skillName).join(", ") || "No Skills Submitted"}</Text>
                                </DataDisplayItem>
                        </GridItem>
                        </Grid>
                        </Box>
                    ))}
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

    <Head>
        {/* LordIcon library for animated icons */}
        <script src="https://cdn.lordicon.com/lordicon.js" async defer></script>
    </Head>

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
     bg="white"
     borderRadius="md"
     boxShadow="md"
     p={8}
     mt={3}
     position="relative"
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