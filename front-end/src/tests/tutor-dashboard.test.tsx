import { render, screen, fireEvent } from "@testing-library/react";
import TutorDashboard from "@/pages/tutor-dashboard";
import { useAuth } from "@/context/AuthLogic";
import { ChakraProvider } from "@chakra-ui/react";



//mock chakra toast to prevent actual toast rendering during tests..
jest.mock("@chakra-ui/react", () => {
  const actual = jest.requireActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => jest.fn(),
  };
 });



//mock header and footer to simplify layout during testing..
jest.mock("@/components/Header", () => {
  const HeaderMock = () => <div>Header</div>;
  HeaderMock.displayName = "MockHeader";
  return HeaderMock;
});

// mock Footer component with display name
jest.mock("@/components/Footer", () => {
  const FooterMock = () => <div>Footer</div>;
  FooterMock.displayName = "MockFooter";
  return FooterMock;
});



//mock useAuth hook to simulate authenticated user..
jest.mock("@/context/AuthLogic", () => ({
  useAuth: jest.fn(),
}));




describe("TutorDashboard", () => {
  beforeEach(() => {
    //set a mock user before each test..
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "test@student.rmit.edu.au" },
    });

    //clear local storage to avoid test pollution..
    localStorage.clear();
  });

  //utility to wrap the component in ChakraProvider..
  const customRender = () =>
    render(
      <ChakraProvider>
        <TutorDashboard />
      </ChakraProvider>
    );




  it("renders TutorDashboard with all sections", () => {
    customRender();

    //check if all major form sections are present on initial load..
    expect(screen.getByText(/Apply to Teach/i)).toBeInTheDocument();
    expect(screen.getByText(/Tell us the role you're interested in/i)).toBeInTheDocument();
    expect(screen.getByText(/Which course\(s\) would you like to support/i)).toBeInTheDocument();
    expect(screen.getByText(/Your experience matters/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose your availability/i)).toBeInTheDocument();
    expect(screen.getByText(/Which tools and languages/i)).toBeInTheDocument();
    expect(screen.getByText(/academic journey/i)).toBeInTheDocument();
  });




  it("shows validation error if required fields are empty", () => {
    customRender();

    //trigger form submission with empty fields..
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    //check for all validation messages..
    expect(screen.getByText(/Role should not be empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Select at least one course/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter previous role/i)).toBeInTheDocument();
    expect(screen.getByText(/Select availability/i)).toBeInTheDocument();
    expect(screen.getByText(/Select at least one skill/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter academic credential/i)).toBeInTheDocument();
  });



  it("allows user to select role and updates state", () => {
    customRender();

    //simulate selecting the "Tutor" role..
    fireEvent.click(screen.getByText("Tutor"));

    //try submitting again to check if role error disappears..
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    //expect no error for role field now..
    expect(screen.queryByText(/Role should not be empty/i)).not.toBeInTheDocument();
  });


  
  it("saves application to localStorage on successful submit", () => {
    customRender();

    //fill required fields with sample data..
    fireEvent.click(screen.getByText("Tutor"));
    fireEvent.click(screen.getByLabelText(/COSC2758/i));
    fireEvent.change(screen.getByPlaceholderText(/e.g. Lab Assistant/i), {
      target: { value: "Lab Assistant" },
    });

    //select availability from dropdown (fixed label-based query)..
    fireEvent.change(screen.getByLabelText(/Choose your availability/i), {
      target: { value: "Part-Time" },
    });

    //select a skill and academic credential..
    fireEvent.click(screen.getByLabelText(/React/i));
    fireEvent.change(screen.getByPlaceholderText(/Bachelor of Computer Science/i), {
      target: { value: "Bachelor of Computer Science" },
    });

    //submit the form..
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    //check if data was saved in localStorage..
    const saved = localStorage.getItem("test_applicationData");
    expect(saved).toBeTruthy();

    //verify the stored data content..
    const parsed = saved ? JSON.parse(saved) : null;
    expect(parsed.role).toContain("Tutor");
    expect(parsed.courses[0].id).toBe("COSC2758");
    expect(parsed.skills).toContain("React");
  });
});
