import { useEffect, useState } from "react";
import{ Avatar, Badge, Box, Button, Divider, Flex, Grid, GridItem, HStack, Icon, Text, useToast, VStack} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { userApi, tutorApi } from "@/services/api";
import { useAuth } from "@/context/AuthLogic";
import { AxiosError } from "axios";
import Header from "@/components/Header";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "@/components/Footer";
import {IconType} from "react-icons";
import { FiUser, FiFileText,FiAward, FiCalendar, FiMail, FiClock, FiBook, FiBriefcase} from "react-icons/fi";

interface TutorData{
    sessionType: string[];
    courses: {courseID: number; courseCode: string; courseName: string; semester: string; description: string}[];
    previousRoles: string[];
    availability: string;
    timestamp: string;
    skills: {skillId: number; skillName: string}[];
    academicCredentials : {credentialId: number; qualification: string; institution : string; year: number}[];
    status: "pending" | "approved" | "rejected";
}

interface UserProfile{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username : string;
    dateOfJoining: string;
    assignedCourses?: {courseID: number; courseCode: string; courseName: string; semester: string; description: string}[];
    //intentionally don't want to display passsword for security reasons
}

const MotionBox = motion(Box); 
const MotionFlex = motion(Flex);

//defining menu items for profile
const studentMenuItems = ["Personal Details", "Application Details", "Qualifications & Skills"] as const;
const staffMenuItems = ["Personal Details", "Assigned Courses"] as const;

type StudentMenuKey = typeof studentMenuItems[number];
type StaffMenuKey = typeof staffMenuItems[number];

type ProfileMenuKey = StudentMenuKey | StaffMenuKey;

const menuIcons = {
    "Personal Details" : FiUser,
    "Application Details": FiFileText,
    "Qualifications & Skills": FiAward,
    "Assigned Courses": FiBook,
};

//Helper function to determine user role
const getUserRole = (email: string): 'student' | 'staff' => {
    return email.includes('@student.rmit.edu.au') ? 'student' : 'staff';
};

//component for profile menu
interface ProfileHeaderProps{
activeMenu : ProfileMenuKey;
onMenuChange: (menu: ProfileMenuKey) => void;
tutorData: TutorData[];
userRole: 'student' | 'staff';
}

const ProfileHeader : React.FC<ProfileHeaderProps> = ({activeMenu, onMenuChange, tutorData, userRole}) => {
    const menuItems = userRole === 'student' ? studentMenuItems : staffMenuItems;
   
    return (
        <MotionFlex
            p={6}
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            justify="center"
            mb={8}
            border="1px solid rgba(255, 255, 255, 0.2)"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <HStack spacing={2}>
                {menuItems.map((item) => {
                    const IconComponent = menuIcons[item];
                    const isActive = activeMenu === item;
                    const isDisabled = item === "Application Details" && !tutorData?.length;
                    
                    return (
                        <MotionBox
                            key={item}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="ghost"
                                cursor="pointer"
                                onClick={() => onMenuChange(item as ProfileMenuKey)}
                                isDisabled={isDisabled}
                                px={6}
                                py={3}
                                height="auto"
                                borderRadius="xl"
                                color={isActive ? "white" : "blue.700"}
                                bg={isActive ? "blue.500" : "transparent"}
                                backdropFilter={isActive ? "blur(10px)" : "none"}
                                border="1px solid"
                                borderColor={isActive ? "rgba(59, 130, 246, 0.3)" : "transparent"}
                                _hover={{
                                    bg: isActive ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.9)",
                                    color: "white",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)"
                                }}
                                _disabled={{
                                    opacity: 0.4,
                                    cursor: "not-allowed"
                                }}
                                transition="all 0.3s ease"
                            >
                                <HStack justify="space-around">
                                    <Icon as={IconComponent} />
                                    <Text fontSize="sm" fontWeight="medium">{item}</Text>
                                </HStack>
                            </Button>
                        </MotionBox>
                    );
                })}
            </HStack>
        </MotionFlex>
    );
};

const Profile = () => {
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [activeMenu, setActiveMenu] = useState<ProfileMenuKey>("Personal Details");
    const router = useRouter();
    const toast = useToast();
    const {currentUserEmail} = useAuth();
    const [tutorData, setTutorData] = useState<TutorData[]>([]);
    //determine user role
    const userRole = currentUserEmail ? getUserRole(currentUserEmail) : 'student';

    const  getStatusColor = (status:string)=>{
        switch(status){
            case "approved" : return "green";
            case "pending" : return "yellow";
            case "rejected" : return "red";
            default: return "gray";
        }
    };


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
                // Only fetch tutor data for students
                if (userRole === 'student') {
                    try {
                        const tutorRes = await tutorApi.getApplicationByEmail(currentUserEmail);
                        const normalized = Array.isArray(tutorRes) ? tutorRes : [tutorRes];
                        setTutorData(normalized.map(app => ({
                            ...app,
                            sessionType: Array.isArray(app.sessionType) ? app.sessionType : [app.sessionType]
                        })));
                    } catch {
                        console.warn("Tutor Application not found or failed to fetch");
                    }
                }

                setLoading(false);
            } catch (error) {
                const axiosError = error as AxiosError<{ message: string }>;
                if (axiosError.response) {
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
        };
        fetchProfile();
    }, [currentUserEmail, router, toast, userRole]);

    if (loading) {
        return (
            <MotionBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                minH="100vh"
                bgGradient="linear(to-br, blue.600, black)"
            >
                <MotionBox
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Box
                        width="50px"
                        height="50px"
                        border="4px solid rgba(255, 255, 255, 0.3)"
                        borderTop="4px solid white"
                        borderRadius="50%"
                    />
                </MotionBox>
            </MotionBox>
        );
    }

    if (error) {
        return <Box color="red.500" textAlign="center" p={8}>{error}</Box>;
    }

    if (!profileData) {
        return <Box textAlign="center" p={8}>No Profile Data available</Box>;
    }

    const InfoCard = ({icon, label, value, colSpan =1}:{
        icon: IconType; 
        label: string; 
        value: React.ReactNode; 
        colSpan?: number 
    })=>(
        <GridItem colSpan={colSpan}>
            <MotionBox
                bg="rgba(255, 255, 255, 0.9)"
                backdropFilter="blur(10px)"
                borderRadius="xl"
                p={4}
                border="1px solid rgba(255, 255, 255, 0.2)"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
                whileHover={{ 
                    y: -2, 
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)" 
                }}
                transition={{ duration: 0.2 }}
            >
                <VStack align="stretch" spacing={3}>
                    <HStack>
                        <Icon as={icon} color="blue.500" boxSize={5} />
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600">{label}</Text>
                    </HStack>
                    <Box
                        bg="white"
                        borderRadius="lg"
                        p={3}
                        border="1px solid"
                        borderColor="gray.100"
                        minH="50px"
                        display="flex"
                        alignItems="center"
                    >
                        <Text fontSize="md" fontWeight="medium" color="gray.800">{value}</Text>
                    </Box>
                </VStack>
            </MotionBox>
        </GridItem>
    );

const renderActiveProfileSection = () => {

    const containerVariants = {
        hidden: {opactity: 0, x:20},
        visible:{
            opacity: 1,
            x:0,
            transition: {duration: 0.5, staggerChildren: 0.1}
        },
        exit:{opacity: 0, x:-20, transition:{duration:0.3}}
    };

    const itemVariants = {
        hidden: {opacity: 0, y:20},
        visible: {opacity: 1, y:0}
    }

    switch(activeMenu){
        case "Personal Details":
            return (
            <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            >
            <VStack spacing={6} align="stretch">
                <Grid templateColumns="repeat(2,1fr)" gap={6}>
                    <InfoCard
                    icon={FiUser}
                    label= "First Name"
                    value={profileData.firstName}
                    />
                    <InfoCard
                    icon={FiUser}
                    label= "Last Name"
                    value={profileData.lastName}
                    />
                    <InfoCard
                    icon={FiMail}
                    label= "Email"
                    value={profileData.email}
                    />
                    <InfoCard
                    icon={FiUser}
                    label= "Username"
                    value={profileData.username}
                    />
                    <InfoCard
                    icon={FiUser}
                    label= "Date Of Joining"
                    value={new Date(profileData.dateOfJoining).toLocaleDateString()}
                    colSpan={2}
                    />
                </Grid>
            </VStack>
            </MotionBox>

        );
        case "Assigned Courses":
             return (
             <MotionBox
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
               >
                 <VStack spacing={6} align="stretch">
                    <InfoCard 
                        icon={FiBook} 
                        label="Assigned Courses" 
                        value={
                            profileData.assignedCourses?.length ? (
                               <VStack align="start" spacing={2}>
                               {profileData.assignedCourses.map((course, idx) => (
                                <Box key={idx} p={3} bg="gray.50" borderRadius="md" width="100%">
                                <Text fontSize="md" fontWeight="medium">
                                {course.courseCode} {course.courseName}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                Semester: {course.semester}
                                </Text>
                                {course.description && (
                                <Text fontSize="sm" color="gray.500" mt={1}>
                                {course.description}
                                </Text>
                                )}
                                </Box>
                               ))}
                             </VStack>
                             ) : "No courses assigned"
                             }
                        colSpan={1}
                        />
                        </VStack>
                    </MotionBox>
                );
       case "Application Details":
                // Only show for students
                if (userRole !== 'student') return null;
                
                return tutorData.length > 0 ? (
                    <MotionBox
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <VStack spacing={6}>
                            {tutorData.map((app, i) => (
                                <MotionBox
                                    key={i}
                                    variants={itemVariants}
                                    bg="rgba(255, 255, 255, 0.9)"
                                    backdropFilter="blur(10px)"
                                    borderRadius="xl"
                                    p={6}
                                    width="100%"
                                    border="1px solid rgba(255, 255, 255, 0.2)"
                                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
                                >
                                    <VStack align="stretch" spacing={4}>
                                        <HStack justify="space-between" align="center" flexWrap="wrap">
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="xl" fontWeight="bold" color="blue.700">
                                                    Application {i + 1}
                                                </Text>
                                                <Badge
                                                    colorScheme={getStatusColor(app.status)}
                                                    variant="outline"
                                                    px={3}
                                                    py={1}
                                                    borderRadius="full"
                                                    fontSize="sm"
                                                >
                                                    Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)} {/* Capitalize for display */}
                                                </Badge>
                                            </VStack>
                                            <HStack flexWrap="wrap">
                                                {app.sessionType.map((type, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        colorScheme="blue"
                                                        variant="subtle"
                                                        px={4}
                                                        py={2}
                                                        borderRadius="full"
                                                        fontSize="md"
                                                        fontWeight="bold"
                                                    >
                                                        {type === "tutor" ? "Tutor" : type === "lab" ? "Lab Assistant" : type}
                                                    </Badge>
                                                ))}
                                            </HStack>
                                        </HStack>

                                        <Divider />

                                        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                                            <InfoCard 
                                                icon={FiClock} 
                                                label="Availability" 
                                                value={app.availability} 
                                            />
                                            <InfoCard 
                                                icon={FiCalendar} 
                                                label="Submitted" 
                                                value={new Date(app.timestamp).toLocaleString()} 
                                            />
                                            <InfoCard 
                                                icon={FiBook} 
                                                label="Courses Applied" 
                                                value={
                                                    app.courses.length > 0 ? (
                                                        <VStack align="start" spacing={1}>
                                                            {app.courses.map((course, idx) => (
                                                                <Text key={idx} fontSize="sm">
                                                                    {course.courseCode} {course.courseName}
                                                                </Text>
                                                            ))}
                                                        </VStack>
                                                    ) : "No courses applied"
                                                }
                                                colSpan={2}
                                            />
                                            <InfoCard 
                                                icon={FiBriefcase} 
                                                label="Previous Roles" 
                                                value={
                                                    app.previousRoles.length > 0 ? (
                                                        <VStack align="start" spacing={1}>
                                                            {app.previousRoles.map((role, idx) => (
                                                                <Text key={idx} fontSize="sm"> {role}</Text>
                                                            ))}
                                                        </VStack>
                                                    ) : "No previous roles"
                                                }
                                                colSpan={2}
                                            />
                                        </Grid>
                                    </VStack>
                                </MotionBox>
                            ))}
                        </VStack>
                    </MotionBox>
                ) : (
                    <MotionBox
                        textAlign="center"
                        p={8}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <Text fontSize="lg" color="gray.600">No Tutor Application Details found.</Text>
                    </MotionBox>
                );

        case "Qualifications & Skills":
                return tutorData.length > 0 ? (
                    <MotionBox
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <VStack spacing={6}>
                            {tutorData.map((app, i) => (
                                <MotionBox
                                    key={i}
                                    variants={itemVariants}
                                    bg="rgba(255, 255, 255, 0.9)"
                                    backdropFilter="blur(10px)"
                                    borderRadius="xl"
                                    p={6}
                                    width="100%"
                                    border="1px solid rgba(255, 255, 255, 0.2)"
                                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
                                >
                                    <VStack align="stretch" spacing={4}>
                                        <HStack justify="space-between" align="center" flexWrap="wrap">
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="xl" fontWeight="bold" color="blue.700">
                                                    Application {i + 1}
                                                </Text>
                                            </VStack>
                                            <HStack flexWrap="wrap">
                                                {app.sessionType.map((type, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        colorScheme="blue"
                                                        variant="subtle"
                                                        px={4}
                                                        py={2}
                                                        borderRadius="full"
                                                        fontSize="md"
                                                        fontWeight="bold"
                                                    >
                                                        {type === "tutor" ? "Tutor" : type === "lab" ? "Lab Assistant" : type}
                                                    </Badge>
                                                ))}
                                            </HStack>
                                        </HStack>

                                        <Divider />

                                        <Grid templateColumns="1fr" gap={6}>
                                            <InfoCard 
                                                icon={FiAward} 
                                                label="Academic Credentials" 
                                                value={
                                                    app.academicCredentials?.length ? (
                                                        <VStack align="start" spacing={2}>
                                                            {app.academicCredentials.map((cred, index) => (
                                                                <Box key={index} p={2} bg="gray.100" borderRadius="md" width="100%">
                                                                    <Text fontSize="sm" fontWeight="medium">
                                                                        {cred.qualification}
                                                                    </Text>
                                                                    <Text fontSize="xs" color="gray.600">
                                                                        {cred.institution} • {cred.year}
                                                                    </Text>
                                                                </Box>
                                                            ))}
                                                        </VStack>
                                                    ) : "No credentials submitted"
                                                }
                                            />
                                            <InfoCard 
                                                icon={FiAward} 
                                                label="Skills" 
                                                value={
                                                    app.skills?.length ? (
                                                        <Flex wrap="wrap" gap={2}>
                                                            {app.skills.map((skill, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    colorScheme="green"
                                                                    variant="subtle"
                                                                    px={2}
                                                                    py={1}
                                                                    borderRadius="md"
                                                                >
                                                                    {skill.skillName}
                                                                </Badge>
                                                            ))}
                                                        </Flex>
                                                    ) : "No skills submitted"
                                                }
                                            />
                                        </Grid>
                                    </VStack>
                                </MotionBox>
                            ))}
                        </VStack>
                    </MotionBox>
                )  : (
                    <MotionBox
                        textAlign="center"
                        p={8}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <Text fontSize="lg" color="gray.600">No Qualifications and Skills found.</Text>
                    </MotionBox>
                );

            default:
                return null;
        }
    };
return(
    <>

    <Header />   
            <MotionBox
                p={4}
                bgGradient="linear(to-br, blue.600, black)"
                minH="100vh"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                display="flex"
                justifyContent="center"
                alignItems="flex-start"
            >
                <MotionBox
                    width="100%"
                    maxW="5xl"
                    bg="rgba(255, 255, 255, 0.95)"
                    backdropFilter="blur(20px)"
                    borderRadius="3xl"
                    border="1px solid rgba(255, 255, 255, 0.3)"
                    boxShadow="0 25px 50px rgba(0, 0, 0, 0.15)"
                    p={8}
                    mt={20}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <MotionBox
                        textAlign="center"
                        mb={4}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                       
                            <Avatar
                                size="xl"
                                name={`${profileData.firstName} ${profileData.lastName}`}
                                bg="blue.500"
                                color="white"
                                fontSize="xl"
                                border="3px solid white"
                                boxShadow="0 4px 20px rgba(59, 130, 246, 0.3)"
                            />

                             <Text 
                            fontSize="4xl" 
                            fontWeight="bold" 
                            bgGradient="linear(to-r, blue.600, blue.800)"
                            bgClip="text"
                            textAlign="center"
                            mb={2}
                        >
                            Your Profile
                        </Text>
                        <Text fontSize="lg" color="gray.600" textAlign="center">
                            {userRole === 'student' 
                                ? "Manage your personal information and applications"
                                : "Manage your personal information and course assignments"
                            }
                        </Text>
                      
                       
                    </MotionBox>

                    <ProfileHeader 
                        activeMenu={activeMenu} 
                        onMenuChange={setActiveMenu} 
                        tutorData={tutorData} 
                        userRole={userRole}
                    />

                    <AnimatePresence mode="wait">
                        <MotionBox key={activeMenu}>
                            {renderActiveProfileSection()}
                        </MotionBox>
                    </AnimatePresence>
                </MotionBox>
            </MotionBox>

            <Footer />
        </>
    );
};

export default Profile;