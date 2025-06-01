import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useToast,
  Heading,
  Flex,
  Text,
  Divider,
  FormErrorMessage,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useState } from "react";

const GET_COURSES = gql`
  query {
    getCourses {
      courseID
      courseCode
      courseName
      semester
      description
    }
  }
`;

const ADD_COURSE = gql`
  mutation AddCourse($input: CourseInput!) {
    addCourse(input: $input) {
      courseID
    }
  }
`;

const EDIT_COURSE = gql`
  mutation EditCourse($courseID: ID!, $input: CourseInput!) {
    editCourse(courseID: $courseID, input: $input) {
      courseID
    }
  }
`;

const DELETE_COURSE = gql`
  mutation DeleteCourse($courseID: ID!) {
    deleteCourse(courseID: $courseID)
  }
`;

type Course = {
  courseID: number;
  courseCode: string;
  courseName: string;
  semester: string;
  description: string;
};

export default function CourseManager() {
  const toast = useToast();
  const { data, refetch } = useQuery(GET_COURSES);
  const [addCourse, { loading: addLoading }] = useMutation(ADD_COURSE);
  const [editCourse, { loading: editLoading }] = useMutation(EDIT_COURSE);
  const [deleteCourse] = useMutation(DELETE_COURSE);

  const [activeTab, setActiveTab] = useState<"add" | "edit" | "delete">("add");
  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    semester: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState({
    courseCode: "",
    courseName: "",
    semester: "",
    description: "",
  });

const handleSubmit = async () => {
  try {
    if (editingId !== null) {
      await editCourse({ variables: { courseID: editingId, input: form } });
      toast({
        title: "Course Updated",
        description: `${form.courseCode} has been successfully updated.`,
        status: "success",
        position: "top",
        variant: "subtle",
        duration: 4000,
        isClosable: true,
      });
    } else {
      await addCourse({ variables: { input: form } });
      toast({
        title: "Course Added",
        description: `${form.courseCode} has been successfully added.`,
        status: "success",
        position: "top",
        variant: "subtle",
        duration: 4000,
        isClosable: true,
      });
    }

    setForm({ courseCode: "", courseName: "", semester: "", description: "" });
    setEditingId(null);
    setErrors({ courseCode: "", courseName: "", semester: "", description: "" });
    await refetch();
  } catch (err: unknown) {
    const errorMessage =
      typeof err === "object" && err !== null && "message" in err
        ? (err as { message?: string }).message || "Something went wrong"
        : "Something went wrong";

    toast({
      title: "Error",
      description: errorMessage.includes("Course code already exists")
        ? "Course code already exists. Please use a different code."
        : errorMessage,
      status: "error",
      position: "top",
      variant: "left-accent",
      duration: 4000,
      isClosable: true,
    });

    if (errorMessage.includes("Course code already exists")) {
      setErrors((prev) => ({
        ...prev,
        courseCode: "This course code already exists.",
      }));
    }
  }
};


  const handleEdit = (course: Course) => {
    setForm({
      courseCode: course.courseCode,
      courseName: course.courseName,
      semester: course.semester,
      description: course.description,
    });
    setEditingId(course.courseID);
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this course?")) return;
  try {
    await deleteCourse({ variables: { courseID: id } });
    toast({
      title: "Course Deleted",
      description: "The course has been successfully removed.",
      status: "info",
      position: "top",
      variant: "left-accent",
      duration: 4000,
      isClosable: true,
    });
    await refetch();
  } catch {
    toast({
      title: "Delete Failed",
      description: "Something went wrong while deleting the course.",
      status: "error",
      position: "top",
      variant: "left-accent",
      duration: 4000,
      isClosable: true,
    });
  }
};


  return (
    <Box bgGradient="linear(to-br, blue.600, black)" minH="100vh" px={[4, 6, 12]} py={16}>
      <Box px={6} py={10} maxW="6xl" mx="auto">
        <Heading mb={6} textAlign="center" color="white" fontSize="3xl">
          Course Manager
        </Heading>

        <Box bg="white" rounded="xl" shadow="md" p={8} border="1px solid" borderColor="gray.200">
          <ButtonGroup mb={6} display="flex" justifyContent="center">
            <Button
              colorScheme={activeTab === "add" ? "blue" : "gray"}
              onClick={() => {
                setActiveTab("add");
                setEditingId(null);
                setForm({ courseCode: "", courseName: "", semester: "", description: "" });
              }}
            >
              Add Course
            </Button>
            <Button
              colorScheme={activeTab === "edit" ? "blue" : "gray"}
              onClick={() => setActiveTab("edit")}
            >
              Edit Course
            </Button>
            <Button
              colorScheme={activeTab === "delete" ? "blue" : "gray"}
              onClick={() => setActiveTab("delete")}
            >
              Delete Course
            </Button>
          </ButtonGroup>

          {editingId !== null && activeTab === "add" && (
            <Text mb={4} textAlign="center" color="blue.500" fontWeight="medium">
              Editing Course 
            </Text>
          )}

          <Divider mb={8} />

          {(activeTab === "add" || editingId !== null) && (
            <Box p={6} bg="gray.50" borderRadius="md" mb={10}>
              <Stack spacing={4}>
                <FormControl isRequired isInvalid={!!errors.courseCode}>
                  <FormLabel>Course Code</FormLabel>
                  <Input
                    placeholder="e.g., COSC1101"
                    value={form.courseCode}
                    onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                    focusBorderColor="blue.500"
                    isDisabled={editingId !== null} 
                  />
                  <FormErrorMessage>{errors.courseCode}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.courseName}>
                  <FormLabel>Course Name</FormLabel>
                  <Input
                    placeholder="e.g., Intro to IT"
                    value={form.courseName}
                    onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{errors.courseName}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.semester}>
                  <FormLabel>Semester</FormLabel>
                  <Input
                    placeholder="e.g., 1"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{errors.semester}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.description}>
                  <FormLabel>Description</FormLabel>
                  <Input
                    placeholder="Short description of the course"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{errors.description}</FormErrorMessage>
                </FormControl>

                <Button
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isLoading={addLoading || editLoading}
                  w="fit-content"
                  alignSelf="end"
                >
                  {editingId !== null ? "Update Course" : "Add Course"}
                </Button>
              </Stack>
            </Box>
          )}

          {(activeTab === "edit" || activeTab === "delete") && (
            <>
              <Heading size="md" mb={4} color="gray.700">
                Available Courses
              </Heading>
              <Table variant="simple" size="md">
                <Thead bg="gray.100">
                  <Tr>
                    <Th>Code</Th>
                    <Th>Name</Th>
                    <Th>Semester</Th>
                    <Th>Description</Th>
                    <Th textAlign="center">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data?.getCourses?.map((course: Course) => (
                    <Tr key={course.courseID}>
                      <Td>{course.courseCode}</Td>
                      <Td>{course.courseName}</Td>
                      <Td>{course.semester}</Td>
                      <Td>{course.description}</Td>
                      <Td>
                        <Flex gap={2} justify="center">
                          {activeTab === "edit" && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEdit(course)}
                            >
                              Edit
                            </Button>
                          )}
                          {activeTab === "delete" && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(course.courseID)}
                            >
                              Delete
                            </Button>
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}