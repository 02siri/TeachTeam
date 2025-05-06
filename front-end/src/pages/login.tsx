import { useState } from "react";
import { useAuth } from "../context/AuthLogic";
import { useRouter } from "next/router";
import {motion} from "framer-motion"; 
import { useInView } from "framer-motion"; 
import { useRef } from "react";
import React from "react";
import Head from "next/head";
import Image from "next/image";


import {
    Box,
    Button,
    FormControl, 
    FormLabel, 
    FormHelperText, 
    Input,
    Text,
    Heading,
    VStack,
    useToast,
    InputGroup,
    InputRightElement,
    Flex,
  } from "@chakra-ui/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Custom password input component with show/hide functionality
function PasswordInput({value, onChange} : {value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>)=>void}) {
    const [show, setShow] = useState(false); // State to toggle password visibility
    const handleClick = () => setShow(!show); // Toggle function
    return (
       <InputGroup size='md'>
         <Input
         name = "password"
          placeholder="Enter your password"
           pr='4.5rem' 
           type={show ? 'text' : 'password'} // Conditionally show as text or password
           focusBorderColor = "blue.400"
           value={value}
           onChange={onChange}
           color = "black"
           bg = "gray.100" 
           rounded = "md"
         />
         <InputRightElement width='4.5rem'>
           <Button h='1.75rem' size='sm' onClick={handleClick}>
             {show ? 'Hide' : 'Show'}
           </Button>
         </InputRightElement>
       </InputGroup>
     );
   }

export default function LoginPage(){
    // State for form validation errors
    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });

    // State for form input values
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    // State for rotating quotes on hover
    const [quoteIndex, setQuoteIndex] = useState(0);

    // Hooks for authentication, routing, and UI feedback
    const {login} = useAuth();
    const router = useRouter();
    const toast = useToast(); // For showing toast notifications
    const loginRef = useRef(null); // Reference for animation trigger
    const isInView = useInView(loginRef, {once: true}); // Animation trigger when component comes into view


    // Email validation, checks for RMIT student or staff email format
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@(student|staff)\.rmit\.edu\.au$/;
        return emailRegex.test(email);
    };
  
    // Password validation implementation checking for security requirements
    const validatePassword = (password : string) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 10;
        
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;
    }

    // Handle input changes and update form state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev)=>({
            ...prev,
            [name] : value,
        }));
    };

    // Form submission handler
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({
            email: "", 
            password: ""
        });
    
        let hasErrors = false;
    
        // Validate email format
        if(!validateEmail(formData.email)){
            setErrors((prev)=>({
                ...prev,
                email : "Please enter a valid RMIT email.",
            }));
            hasErrors = true;
        }
    
        // Validate password strength
        if(!validatePassword(formData.password)){
            setErrors((prev)=>({
                ...prev,
                password : "Please enter a valid password .",
            }));
            hasErrors = true;
        }
    
        // If no validation errors, attempt login
        if(!hasErrors){
        const success = login(formData.email, formData.password);

        if(success){
                // Show success toast and redirect on successful login
                toast({
                    title: "Your Login was Successful ! ",
                    description: "Redirecting to Dashboard",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                //router.push("/tutor-dashboard");
                router.push("/");
            }else{
                // Show error for invalid credentials
                setErrors((prev)=>({
                    ...prev,
                    password: "Invalid email or password.",
                }));
            }
        }
    };

        // Array of inspirational teaching quotes for display
        const quotes = [
            "Teach. Inspire. Grow.",
            "Every great achiever is inspired by a great mentor",
            "Learning never exhausts the mind - it only ignites it!",
            "It takes a big heart to shape little minds",
            "Teaching is not a job, its a superpower"
        ];

        // Function to rotate through quotes on hover
        const handleQuoteHover = () => {
            setQuoteIndex((prev)=>(prev+1)%quotes.length);
        };
    
    return (
        <>
        <Head>
        {/* LordIcon library for animated icons */}
        <script src="https://cdn.lordicon.com/lordicon.js" async defer></script>
        </Head>
    
        <Header />

        {/* Full Screen Motion Container with initial fade-in animation */}
        <motion.div
            initial = {{ opacity: 0}}
            animate ={{opacity: 1}}
            transition = {{duration: 1}}
            className="min-h-screen flex items-center justify-center relative text-white bg-black overflow-hidden"
        >

        {/* Background image for the login page */}
        <Image
        src="/loginBG.jpg"
        alt="Background"
        fill
        className="object-cover z-0"
        style={{ position: "absolute", inset: 0 }}/>

        {/* Login Card with animation that triggers when scrolled into view */}
        <motion.div
            ref = {loginRef}
            initial = {{ opacity: 0, y: 50}}
            animate ={isInView? {opacity: 1, y: 0} : {}}
            transition = {{duration: 1, ease: "easeOut"}}
            className="relative z-10 p-10 rounded-2xl shadow-2xl w-full max-w-4xl bg-white backdrop-blur-md text-white"
        >

         {/* Responsive layout with column direction on mobile, row on desktop */}
         <Flex direction = {{base: "column", md: "row"}} height = {{md: "500px"}}>
            {/* Left Column - Quotes and Animation */}
            <Box
            onMouseMove={handleQuoteHover} // Change quote on hover
            w={{ base: "100%", md: "50%" }}
            className="flex flex-col justify-between items-start text-[#0E4C92] p-8 rounded-r-2xl md:rounded-l-2xl bg-[#0E4C92]/20"
            >
            
            <Box className = "flex flex-col justify-center items-center w-full gap-6">
            {/* Animated quote that changes on hover */}
             <motion.div
            key={quoteIndex} // Key changes trigger re-render/animation
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{duration: 0.5}}
            >
                <Text
                fontSize={{ base: "4xl", md: "4xl" }}
                fontWeight="bold"
                textAlign="left"
                lineHeight="1.6"
                >
                    {`"${quotes[quoteIndex]}"`}
                </Text>


                <Text fontSize="md" opacity={0.6} mt={4}>Hover to inspire ✨</Text>
            </motion.div>
             {/* Animated LordIcon */}
            <Box
                mt={8}
                display="flex"
                justifyContent="center"
                alignItems="center"
                dangerouslySetInnerHTML={{
                __html: `
                    <lord-icon
                    src="https://cdn.lordicon.com/aksvbzmu.json"
                    trigger="in"
                    delay="200"
                    state="in-reveal"
                    colors="primary:#66a1ee,secondary:#242424"
                    style="width:200px;height:200px">
                    </lord-icon>
                `,
                }}
            />
            </Box>
            </Box>

            {/* Right Column - Login Form */}
            <Box 
            w={{base: "100%", md: "50%"}}
            bg = "transparent"
            p={8}
            display = "flex"
            flexDirection= "column"
            justifyContent= "center"
            className="rounded-r-2xl md:rounded-r-2xl md:rounded-l-none"
            >
                {/* Form container with slide-in animation */}
                <motion.div
                initial = {{ opacity: 0, x: 30}}
                animate ={{opacity: 1, x: 0}}
                transition = {{delay: 0.7, duration: 0.8}}
                >

                <Heading as = "h2" size = "lg" color = "#0E4C92" textAlign = "center" mb= {6}>Sign In</Heading>     
                
                    {/* Login form with validation */}
                    <form onSubmit={handleSubmit} noValidate>
                        <VStack spacing = {5}>
                            {/* Email input field */}
                            <FormControl isRequired isInvalid={!!errors.email}>
                                <FormLabel color = "#0E4C92" fontWeight = "bold">Email</FormLabel>
                                <Input 
                                    name = "email"
                                    placeholder="Enter your RMIT email"
                                    focusBorderColor = "blue.400"
                                    bg = "gray.100"
                                    color = "black"
                                    rounded = "md"
                                    value={formData.email}
                                    onChange={handleChange} />

                                 <FormHelperText color="#0E4C92">Your email will be private! </FormHelperText>
                                 
                                 {/* Error message for email validation */}
                                 {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}

                            </FormControl>

                            {/* Password input using custom component */}
                            <FormControl isRequired isInvalid={!!errors.password}>
                                <FormLabel color = "#0E4C92" fontWeight = "bold">Password</FormLabel>
                                <PasswordInput
                                     value={formData.password}
                                    onChange={handleChange} 
                                    />
                                {/* Error message for password validation */}
                                {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </FormControl>
                            
                            {/* Sign In button with hover animation */}
                            <motion.div
                            whileHover= {{scale: 1.03}} // Slightly enlarge on hover
                            whileTap = {{scale: 0.97}} // Slightly shrink on click
                            style = {{width: "90%"}}
                            >
                            <Button 
                            position= "relative" 
                            overflow = "hidden"
                            bgGradient="linear(to-r, #0E4C92, #002147)" // Gradient background
                            _hover={{
                                bgGradient:"linear(to-r,#002147,#0E4C92)", // Reverse gradient on hover
                            }}
                            color="white"
                            fontWeight="semibold"
                            className="group cursor-pointer"
                            type = "submit" 
                            width = "full" 
                            size = "lg" 
                            mt={4} 
                            rounded="full"
                            onMouseDown={(e) => (e.currentTarget.style.cursor = "wait")} // Change cursor on click
                            onMouseUp={(e) => (e.currentTarget.style.cursor = "pointer")}
                            >
                                
                            {/* Background animation layer */}
                            <span className ="absolute inset-0 bg-gradient-to-r from-[#0E4C92] to-[#002147] transition-all duration-300 group-hover:from-[#002147] group-hover:to-[#0E4C92] rounded-full"></span>
                            {/* Button text layer */}
                            <span className="relative z-10">Sign In</span> 
                            </Button>
                            </motion.div>
                        </VStack>
                    </form>
                </motion.div>
            </Box>
         </Flex>
        </motion.div>
        </motion.div>
        <Footer />
        </>
    );
};