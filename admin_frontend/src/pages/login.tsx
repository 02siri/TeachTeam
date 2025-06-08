import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  Box, Button, Input, VStack, Heading, useToast,
  InputGroup,
  InputRightElement,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useAuth } from "../context/Authlogic";
import { motion, useInView } from "framer-motion";

// Custom password input component with show/hide functionality
function PasswordInput({value, onChange, isInvalid} : {value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>)=>void; isInvalid?: boolean}) {
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
           color = "white"
           bg = "rgba(255,255,255,0.1)" 
           rounded = "md"
           _placeholder={{color: "rgba(255,255,255,0.6)"}}
           isInvalid={isInvalid}
           borderColor={isInvalid ? "red.300" : "rgba(255, 255, 255, 0.2)"}
         />
         <InputRightElement width='4.5rem'>
           <Button 
           h='1.75rem' 
           size='sm' 
           onClick={handleClick}
           bg="rgba(255,255,255,0.2)"
           color="white"
           _hover={{bg: "rgba(255,255,255,0.3)"}}>
             {show ? 'Hide' : 'Show'}
           </Button>
         </InputRightElement>
       </InputGroup>
     );
   }
   
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const loginRef = useRef(null);
  const isInView = useInView(loginRef, {once: true});
  const [errors, setErrors] = useState({username: "", password:""});

  useEffect(() => {
    if (sessionStorage.getItem("isAdmin") === "true") {
      router.push("/");
    }
  }, [router]);

  //Form Validation
  const validateForm = () =>{
    const newErrors = {username: "", password: ""};
    let isValid = true;

    if(!username){
      newErrors.username = "Username is required";
      isValid = false;
    }
    if(!password){
      newErrors.password = "Password is required";
      isValid = false;
    }

    if(!username && !password){
      newErrors.password = "Username and Password are required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  const handleLogin = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({username: "", password: ""});

    if(!validateForm()){
      toast({
        title: "Validation Error!",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
    setIsSubmitting(true);
    try{
    const success = await login({ username, password });
    if (success) {
      toast({
        title: "Admin Login Successful!",
        description: "Welcome to Admin Dashboard",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      router.push("/");
    }else{
      toast({
        title: "Invalid credentials",
        description: "Only admin access is allowed. Please enter correct credentials.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }  
  }catch(error) {
    console.log(error);
      toast({
        title: "Invalid credentials",
        description: "Only admin access is allowed. Please enter correct credentials.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally{
      setIsSubmitting(false);
    }
  };

   // Clear errors when user starts typing
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors(prev => ({...prev, username: ""}));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({...prev, password: ""}));
    }
  };

  return (
        <>
     <motion.div
            initial = {{ opacity: 0}}
            animate ={{opacity: 1}}
            transition = {{duration: 1}}
            className="min-h-screen flex items-center justify-center relative text-white bg-black overflow-hidden"
        >

        {/* Background image for the login page */}
        <Image
        src="/adminBG.jpg"
        alt="Background"
        fill
        className="object-cover z-0 opacity-100"
        style={{ position: "absolute", inset: 0 ,}}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-blue-900/60 to-black/80 z-5"></div> 
      
      {/* Login Card with dark frosted glass effect */}
        <motion.div
            ref = {loginRef}
            initial = {{ opacity: 0, y: 50}}
            animate ={isInView? {opacity: 1, y: 0} : {}}
            transition = {{duration: 1, ease: "easeOut"}}
            className="relative z-10 p-10 rounded-2xl shadow-2xl w-full max-w-2xl backdrop-blur-lg border-white/10"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            }}
            
        >
          <Flex direction = {{base: "column", md: "row"}} height = {{md: "350px"}} justifyContent="center">

          <Box
            w={{base: "100%", md: "80%"}}
            maxW="500px"
            bg = "transparent"
            p={6}
            display = "flex"
            flexDirection= "column"
            justifyContent= "flex-start"
            className="rounded-r-2xl"
          >
            {/* Form container with slide-in animation */}
             <motion.div
                initial = {{ opacity: 0, x: 30}}
                animate ={{opacity: 1, x: 0}}
                transition = {{delay: 0.3, duration: 0.8}}
              >
            <Heading 
            as = "h2" 
            size = "lg" 
            textAlign = "center" 
            mb= {6}
            bgColor="white"
            bgClip="text"
            fontWeight="bold"
            >
            Admin Access
            </Heading>  
            <form onSubmit={handleLogin} noValidate>
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel color="blue.200" fontWeight="bold">
                    Username
                  </FormLabel>
                    <Input
                    name="username"
                    placeholder="Enter admin username"
                    focusBorderColor="blue.600"
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    borderColor={errors.username ? "red.300" : "rgba(255, 255, 255, 0.2)"}
                    rounded="md"
                    value={username}
                    onChange={handleUsernameChange}
                    _placeholder={{ color: "rgba(255, 255, 255, 0.6)" }}
                      />
                      <FormErrorMessage color="red.300">
                      {errors.username}
                    </FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="blue.200" fontWeight="bold">
                        Password
                      </FormLabel>
                      <PasswordInput
                        value={password}
                        onChange={handlePasswordChange}
                      />
                      <FormErrorMessage color="red.300">
                      {errors.password}
                    </FormErrorMessage>
                    </FormControl>

                   <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ width: "100%" }}
                    >
                      <Button
                        position="relative"
                        cursor="pointer"
                        overflow="hidden"
                        bgGradient="linear(to-r, #0E4C92, #002147)"
                        _hover={{
                          bgGradient: "linear(to-r, #002147, #0E4C92)",
                        }}
                        color="white"
                        fontWeight="semibold"
                        className="group cursor-pointer"
                        type="submit"
                        width="xs"
                        mx="auto"
                        display="block"
                        size="lg"
                        mt={4}
                        rounded="full"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        border="1px solid rgba(255, 255, 255, 0.2)"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-[#0E4C92] to-[#002147] transition-all duration-300 group-hover:from-[#002147] group-hover:to-[#0E4C92] rounded-full pointer-events-none"></span>
                        <span className="relative z-10">Login</span>
                      </Button>
                    </motion.div>
                  </VStack> 
            
              </form>      
      </motion.div>
    </Box>
    </Flex>
    </motion.div>
    </motion.div>
    </>
  );
}
