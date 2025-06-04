import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useAuth } from "../context/Authlogic";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  const { isAdmin } = useAuth();

  return (
    <Flex 
    direction="column" 
    minH="100vh">

      {/*header mainly for height and color*/}
      <Box
        as="header"
        position="relative"
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="black"
        overflow="hidden"
        color="white"
      >
        {/*I tried to match with the actual TeachTeam css using chakraUI here this 2 boxes from right and left*/}
        <Box
          position="absolute"
          left="-150px"
          top="50%"
          transform="translateY(-50%)"
          w="500px"
          h="500px"
          bg="blue.100"
          opacity="0.2"
          filter="blur(160px)"
          borderRadius="full"
          zIndex={0}
        />
        <Box
          position="absolute"
          right="-150px"
          top="50%"
          transform="translateY(-50%)"
          w="500px"
          h="500px"
          bg="cyan.200"
          opacity="0.2"
          filter="blur(160px)"
          borderRadius="full"
          zIndex={0}
        />
        {/*gradient effect*/}
        <Box
          position="absolute"
          inset="0"
          bgGradient="linear(to-b, transparent, rgba(30,58,138,0.3), white)"
          zIndex={0}
          pointerEvents="none"
        />

        {/*here goest the content */}
        <Flex
          direction={{ base: "column-reverse", md: "row" }}
          justify="space-between"
          align="center"
          zIndex={1}
          maxW="7xl"
          w="full"
          px={6}
          mx="auto"
        >
          {/*left text*/}
          <Box textAlign={{ base: "center", md: "left" }} maxW="xl">
            <Heading
              fontSize={{ base: "4xl", md: "6xl" }}
              fontWeight="extrabold"
              lineHeight="tight"
              color="white"
            >
              Welcome to <Box as="span" color="blue.300">Teach Team</Box>
            </Heading>

            <Text
              mt={6}
              fontSize={{ base: "lg", md: "2xl" }}
              color="blue.100"
            >
              Admin portal for managing courses, lecturers, candidates and reports.
            </Text>

            {isAdmin && (
              <Box mt={8}>
                <Link href="/course" passHref>
                  <Button
                    as="a"
                    size="lg"
                    px={8}
                    py={6}
                    borderRadius="full"
                    fontWeight="semibold"
                    color="white"
                    bgGradient="linear(to-r, #0E4C92, #002147)"
                    _hover={{
                      bgGradient: "linear(to-r, #002147, #0E4C92)",
                      boxShadow: "0 0 15px rgba(255, 255, 255, 0.6)"
                    }}
                    boxShadow="0 0 15px rgba(255, 255, 255, 0.6)"
                  >
                    Manage Courses
                  </Button>
                </Link>
              </Box>
            )}
          </Box>

          {/*image here... */}
          <Box>
            <Image src="/home.png" alt="Teach Team image" width={1000} height={1000} />
          </Box>
        </Flex>
      </Box>

      {/* sign-in option here for admins... flex box for height and stuffs*/}
      {!isAdmin && (
        <Flex
          direction="column" 
          minH="100vh"
          flex="1"
          align="center"
          justify="center"
          px={6}
          py={12}
          bgImage="url('/bg.jpg')"
          bgSize="cover"
          bgPosition="center"
        >
          {/* This box is the sign-in option for admins */}
          <Box
            bg="white"
            p={12}
            rounded="2xl"
            shadow="2xl"
            maxW="2xl"
            w="full"
            textAlign="center"
          >
            <Heading size="xl" color="gray.800">
              Admin Access
            </Heading>

            <Text mt={4} fontSize="lg" color="gray.600">
              Please sign in using admin credentials to access the dashboard and manage data.
            </Text>

            <Box mt={8}>
              <Link href="/login" passHref>
                <Button
                  as="a"
                  size="lg"
                  px={8}
                  py={6}
                  borderRadius="full"
                  fontWeight="semibold"
                  color="white"
                  bgGradient="linear(to-r, #0E4C92, #002147)"
                  _hover={{
                    bgGradient: "linear(to-r, #002147, #0E4C92)",
                    boxShadow: "0 0 15px rgb(71, 71, 71)"
                  }}
                  boxShadow="0 0 15px rgb(71, 71, 71)"
                >
                  Sign In
                </Button>
              </Link>
            </Box>
          </Box>
        </Flex>
      )}
    </Flex>
  );
};

export default Home;
