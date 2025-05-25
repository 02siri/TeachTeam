import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box, Button, Input, VStack, Heading, useToast,
} from "@chakra-ui/react";
import { useAuth } from "../context/Authlogic";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (sessionStorage.getItem("isAdmin") === "true") {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async () => {
    const success = await login({ username, password });
    if (success) {
      router.push("/");
    } else {
      toast({
        title: "Invalid credentials",
        description: "Only admin access is allowed. Please enter correct credentials.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, blue.100, blue.200)"
      px={4}
    >
      <VStack
        spacing={4}
        bg="white"
        p={10}
        borderRadius="lg"
        shadow="xl"
        maxW="md"
        w="100%"
      >
        <Heading size="md" color="blue.700">
          Admin Login
        </Heading>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button colorScheme="blue" w="full" onClick={handleLogin}>
          Login
        </Button>
      </VStack>
    </Box>
  );
}
