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
  FormErrorMessage,
  CardHeader,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useRef } from "react";

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
  type CourseField = "courseCode" | "courseName" | "semester" | "description";

  const editFormRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<Record<CourseField, string>>({
    courseCode: "",
    courseName: "",
    semester: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<CourseField, string>>({
    courseCode: "",
    courseName: "",
    semester: "",
    description: "",
  });

const buttonStyle = {
    px: 5,
    py: 2,
    rounded: "full",
    fontWeight: "semibold",
    fontSize: "sm",
    border: "1px solid",
    transition: "all 0.3s ease-in-out",
  };





const handleSubmit = async () => {
  const newErrors: Record<CourseField, string> = {
    courseCode: "",
    courseName: "",
    semester: "",
    description: "",
  };

  const codePattern = /^COSC\d{4}$/i;
  if (!form.courseCode.trim()) {
    newErrors.courseCode = "Course Code is required.";
  } else if (!codePattern.test(form.courseCode.trim())) {
    newErrors.courseCode = "Course Code must be in format COSCxxxx (e.g., COSC1101).";
  }

  if (!form.courseName.trim()) {
    newErrors.courseName = "Course Name is required.";
  }

  const validSemesters = ["1", "2", "3"];
  if (!form.semester.trim()) {
    newErrors.semester = "Semester is required.";
  } else if (!validSemesters.includes(form.semester.trim())) {
    newErrors.semester = "Semester must be 1, 2, or 3.";
  }

  if (!form.description.trim()) {
    newErrors.description = "Description is required.";
  }

  const hasErrors = Object.values(newErrors).some((err) => err !== "");
  if (hasErrors) {
    setErrors(newErrors);
    toast({
      title: "Validation Error!!!",
      description: "Please fix the highlighted fields.",
      status: "warning",
      position: "top",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  try {
    if (editingId !== null) {
      await editCourse({ variables: { courseID: editingId, input: form } });
      toast({
        title: "Course Updated",
        description: `${form.courseCode} has been successfully updated.`,
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
      });
    } else {
      await addCourse({ variables: { input: form } });
      toast({
        title: "Course Added",
        description: `${form.courseCode} has been successfully added..`,
        status: "success",
        position: "top",
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
    setActiveTab("edit"); 

    setTimeout(() => {
    editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
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
  <Box 
  bgGradient="linear(to-br, blue.600, black)" 
  minH="100vh" 
  px={[4, 6, 12]} 
  py={16}
  >

    <Box 
    maxW="5xl" 
    mx="auto"
    >

      <Heading 
      textAlign="center"
      color="white" 
      fontSize="3xl" 
      mt={4} 
      mb={8}>
        Course Manager
      </Heading>

      <Card
        bg="white"
        shadow="lg"
        borderRadius="2xl"
        transition="all 0.3s ease-in-out"
        _hover={{ transform: "scale(1.02)", boxShadow: "xl" }}
      >
        <CardHeader 
        borderBottomWidth="1px" 
        borderColor="gray.200"
        >

          <ButtonGroup 
          display="flex" 
          justifyContent="center" 
          gap={4}>
            {["add", "edit", "delete"].map((tab) => (

              <Button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as typeof activeTab);
                  if (tab === "add") {
                    setEditingId(null);
                    setForm({ courseCode: "", courseName: "", semester: "", description: "" });
                  }
                }}
                {...buttonStyle}
                bg={activeTab === tab ? "blue.600" : "gray.100"}
                color={activeTab === tab ? "blue.100" : "gray.800"}
                borderColor={activeTab === tab ? "blue.300" : "gray.300"}
                _hover={{
                  bg: activeTab === tab ? "blue.700" : "gray.200",
                  color: activeTab === tab ? "white" : "blue.600",
                  boxShadow: "0 0 10px rgba(173, 216, 230, 0.6)",
                }}
                shadow={activeTab === tab ? "md" : "sm"}
              >
                {tab === "add" && "Add Course"}
                {tab === "edit" && "Edit Course"}
                {tab === "delete" && "Delete Course"}
              </Button>
            ))}
          </ButtonGroup>
        </CardHeader>

        <CardBody>
          {editingId !== null && activeTab === "add" && (
            <Text mb={4} textAlign="center" color="blue.500" fontWeight="medium">
              Editing Course
            </Text>
          )}

          {(activeTab === "add" || (activeTab === "edit" && editingId !== null)) && (
            <Box ref={editFormRef} bg="gray.50" p={6} borderRadius="md" mt={6}>
              {activeTab === "edit" && editingId !== null && (
                <Flex justify="space-between" align="center" mb={4}>
                  <Text color="blue.600" fontWeight="semibold">
                    Editing Course: {form.courseCode}
                  </Text>
                  <Button
                    {...buttonStyle}
                    variant="ghost"
                    color="red.500"
                    borderColor="transparent"
                    _hover={{
                      bg: "red.50",
                      color: "red.600",
                      boxShadow: "0 0 10px rgba(255, 0, 0, 0.4)",
                    }}
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ courseCode: "", courseName: "", semester: "", description: "" });
                      setErrors({ courseCode: "", courseName: "", semester: "", description: "" });
                    }}
                  >
                    Cancel Edit
                  </Button>
                </Flex>
              )}

              <Stack spacing={4}>
                <FormControl isRequired isInvalid={!!errors.courseCode}>
                  <FormLabel>Course Code</FormLabel>
                  <Input
                    placeholder="e.g., COSC1101"
                    value={form.courseCode}
                    onChange={(e) => {
                      setForm({ ...form, courseCode: e.target.value });
                      setErrors((prev) => ({ ...prev, courseCode: "" }));
                    }}
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
                    onChange={(e) => {
                      setForm({ ...form, courseName: e.target.value });
                      setErrors((prev) => ({ ...prev, courseName: "" }));
                    }}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{errors.courseName}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.semester}>
                  <FormLabel>Semester</FormLabel>
                  <Input
                    placeholder="e.g., 1"
                    value={form.semester}
                    onChange={(e) => {
                      setForm({ ...form, semester: e.target.value });
                      setErrors((prev) => ({ ...prev, semester: "" }));
                    }}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{errors.semester}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.description}>
                  <FormLabel>Description</FormLabel>
                  <Input
                    placeholder="Short description of the course"
                    value={form.description}
                    onChange={(e) => {
                      setForm({ ...form, description: e.target.value });
                      setErrors((prev) => ({ ...prev, description: "" }));
                    }}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{errors.description}</FormErrorMessage>
                </FormControl>

                <Button
                  {...buttonStyle}
                  bg="blue.600"
                  color="white"
                  borderColor="blue.300"
                  _hover={{
                    bg: "blue.700",
                    boxShadow: "0 0 10px rgba(173, 216, 230, 0.6)",
                  }}
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
            <Box mt={8}>
              <Heading size="md" mb={4} color="gray.700">
                Available Courses
              </Heading>
              <Table variant="striped" colorScheme="gray">
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
                              {...buttonStyle}
                              size="sm"
                              bg="blue.600"
                              color="white"
                              borderColor="blue.300"
                              _hover={{
                                bg: "blue.700",
                                boxShadow: "0 0 10px rgba(173, 216, 230, 0.6)",
                              }}
                              onClick={() => handleEdit(course)}
                            >
                              Edit
                            </Button>
                          )}
                          {activeTab === "delete" && (
                            <Button
                              {...buttonStyle}
                              size="sm"
                              bg="red.500"
                              color="white"
                              borderColor="red.300"
                              _hover={{
                                bg: "red.600",
                                boxShadow: "0 0 10px rgba(255, 0, 0, 0.5)",
                              }}
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
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  </Box>
);
}