import { useRef, useState } from "react";
import { Button, Input, FormControl, useToast, FormLabel, Box, Text, Heading, InputGroup, InputRightElement, Flex, Link} from "@chakra-ui/react";
import { motion , useInView } from "framer-motion";
import { useRouter } from "next/router";
import {userApi,} from "../services/api";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AxiosError } from "axios";

function PasswordInput({value, onChange} : {value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>)=>void}) {
  const [show, setShow] = useState(false); // State to toggle password visibility
  const toggleShow = () => setShow(!show); // Toggle function
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
         <Button h='1.75rem' size='sm' onClick={toggleShow}>
           {show ? 'Hide' : 'Show'}
         </Button>
       </InputRightElement>
     </InputGroup>
   );
 };

interface NewUser{
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
}
export default function SignUp(){
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  // State for form validation errors
  const [errors, setErrors] = useState({
    email: "",
    password: ""
    });
// State for rotating quotes on hover
  const [quoteIndex, setQuoteIndex] = useState(0);
  const router = useRouter();
  const toast = useToast();   
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registerRef = useRef(null);
  const isInView = useInView(registerRef, {once:true});

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

    const handleInputChange = (e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
        const{name, value} = e.target;

        setNewUser((prev)=>({
            ...prev,
            [name] : value
        }));

        //Resest individual errors
        setErrors((prev)=>({
            ...prev,
            [name] : ""
        }))

        setError("");
    };


  // Handle registration process
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {firstName, lastName, username, email, password} = newUser;

    if (!firstName || !lastName || !email || !username || !password) {
      setError("All fields are required");
      return;
    }

    setErrors({
            email: "", 
            password: ""
        });
     let hasErrors = false;
    
        // Validate email format
        if(!validateEmail(email)){
            setErrors((prev)=>({
                ...prev,
                email : "Email must end in '@rmit.edu.au' .",
            }));
            hasErrors = true;
        }
    
        // Validate password strength
        if(!validatePassword(password)){
            setErrors((prev)=>({
                ...prev,
                password : "Password must have atleast 10 characters, include uppercase, lowercase, number and special character.",
            }));
            hasErrors = true;
        }

if(!hasErrors){
    try {
    setIsSubmitting(true);
    const response = await userApi.createUser({
      ...newUser,
      skills: [],
      credentials: [],
    });
      toast({
            title: "Your Sign Up was Successful ! ",
              description: "Redirecting to Dashboard",
              status: "success",
              duration: 3000,
              isClosable: true,
              });
            //router.push("/tutor-dashboard");
      setNewUser({ firstName: "", lastName: "", username: "", email: "", password: "",});
      router.push("/login");
      console.log("User registered successfully: " , response);
      
    } catch (error) { 
      const axiosError = error as AxiosError<{message: string}>;

      if(axiosError.response && axiosError.response.status === 409){
        setError("Email already exists. Please use a different one.")
      }
      else{
        console.log(axiosError);
      setError("Failed to create user");
      }
    }finally{
        setIsSubmitting(false);
    }
}
  }


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
        <Header />

        {/* Full Screen Motion Container with initial fade-in animation */}
        <motion.div
            initial = {{ opacity: 0}}
            animate ={{opacity: 1}}
            transition = {{duration: 1}}
            className="min-h-screen flex items-center justify-center relative text-white bg-black overflow-hidden"
        >

        {/* Background image for the login page
        <Image
        src="/loginBG.jpg"
        alt="Background"
        fill
        className="object-cover z-0"
        style={{ position: "absolute", inset: 0 }}/>
         */}

        {/* Register Card with animation that triggers when scrolled into view */}
        <motion.div
            ref = {registerRef}
            initial = {{ opacity: 0, y: 50}}
            animate ={isInView? {opacity: 1, y: 0} : {}}
            transition = {{duration: 1, ease: "easeOut"}}
            className="relative z-10 p-10 rounded-2xl shadow-2xl w-full max-w-4xl bg-white backdrop-blur-md text-white"
        >

         {/* Responsive layout with column direction on mobile, row on desktop */}
         <Flex direction = {{base: "column", md: "row"}} height = {{md: "600px"}}>
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

                <Heading as = "h2" size = "lg" color = "#0E4C92" textAlign = "center" mb= {6}>Sign Up</Heading>     
                
                    {/* Register form with validation */}
                <form onSubmit={handleSubmit}>
                {["firstName", "lastName", "username"].map((field) => {
                    const label = field.replace(/([A-Z])/g, ' $1').trim();
                    const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
                    const placeholder = `Enter your ${formattedLabel}`;
                  return (
                    <FormControl key={field} isRequired mb={4} >
                        <FormLabel textTransform="capitalize" color="#0E4C92" fontWeight="bold">
                        {formattedLabel}
                        </FormLabel>
                        <Input
                        name={field} // This remains the camelCase key for state update
                        value={newUser[field as keyof NewUser]}
                        onChange={handleInputChange}
                        bg="gray.100"
                        color="black"
                        focusBorderColor="blue.400"
                        placeholder={placeholder} // Set the placeholder
                        />
                    </FormControl>
                    );
                })}

                <FormControl isInvalid={!!errors.email} isRequired mb={4}>
                  <FormLabel color = "#0E4C92" fontWeight = "bold">Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    bg = "gray.100"
                    color = "black"
                    focusBorderColor="blue.400"
                    placeholder = "Enter your Email"
                  />
                  {errors.email && <Text color="red.300">{errors.email}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.password} isRequired mb={4}>
                  <FormLabel color = "#0E4C92" fontWeight = "bold">Password</FormLabel>
                  <PasswordInput 
                  value={newUser.password} 
                  onChange={handleInputChange} 
                  />
                  {errors.password && <Text color="red.300">{errors.password}</Text>}
                </FormControl>

                {error && <Text color="red.500">{error}</Text>} 
                {/* Register button with hover animation */}
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
                 isLoading = {isSubmitting}
                 disabled = {isSubmitting}
                 >
                {/* Background animation layer */}
                <span className ="absolute inset-0 bg-gradient-to-r from-[#0E4C92] to-[#002147] transition-all duration-300 group-hover:from-[#002147] group-hover:to-[#0E4C92] rounded-full"></span>
                {/* Button text layer */}
                <span className="relative z-10">Register</span> 
                </Button>
                </motion.div>

                <Text mt={6} textAlign="center" color="#0E4C92">
                  Already Registered?{" "}
                  <Link href="/login" color="#0E4C92" fontWeight="bold" textDecor="underline">
                    Sign In!
                  </Link>
                </Text>
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