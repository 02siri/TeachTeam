import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/Header"
import { useAuth } from "@/context/AuthLogic";

  //mock image..
  jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: any) => {
      const { src, alt, ...rest } = props;
      return <img src={src} alt={alt} {...rest} />;
    },
  }));
  
  //mock Link component..
  jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children }: any) => <a href={href}>{children}</a>,
  }));
  
  //mock router
  jest.mock("next/router", () => ({
    useRouter: () => ({
      push: jest.fn(),
      prefetch: jest.fn(),
      pathname: "/",
      route: "/",
      asPath: "/",
      query: {},
    }),
  }));
  
  //mock authlogic
  jest.mock("@/context/AuthLogic", () => ({
    useAuth: jest.fn(),
  }));
  

describe("Header Component", () => {
  const mockLogout = jest.fn();

  //quickly clear all mocks before each test..
  //this is important to ensure that the tests are independent and do not affect each other..
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //test if the header has the correct classes for styling..
  it("renders logo and Home link", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, logout: mockLogout });

    render(<Header />);
    expect(screen.getByAltText("TeachTeam Logo")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });


  //test if the header has the correct classes for styling..
  it("shows Login and Register when user is not logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, logout: mockLogout });

    render(<Header />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });


  //test if the header has the correct classes for styling..
  it("shows Tutor Dashboard for student email", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "s123@student.rmit.edu.au" },
      logout: mockLogout,
    });

    render(<Header />);
    expect(screen.getByText("Tutor Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Lecturer Dashboard")).not.toBeInTheDocument();
    expect(screen.getByText("Welcome, S123!")).toBeInTheDocument();
  });


  //test if the header has the correct classes for styling..
  it("shows Lecturer Dashboard for staff email", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "staff1@staff.rmit.edu.au" },
      logout: mockLogout,
    });

    render(<Header />);
    expect(screen.getByText("Lecturer Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Tutor Dashboard")).not.toBeInTheDocument();
    expect(screen.getByText("Welcome, Staff1!")).toBeInTheDocument();
  });


  //test if the header has the correct classes for styling..
  it("calls logout when logout button is clicked", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "user@rmit.edu.au" },
      logout: mockLogout,
    });

    render(<Header />);
    fireEvent.click(screen.getByText("Logout"));
    expect(mockLogout).toHaveBeenCalled();
  });

  
  //test if the header has the correct classes for styling..
  it("displays Guest if email is empty", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "" },
      logout: mockLogout,
    });

    render(<Header />);
    expect(screen.getByText("Welcome, Guest!")).toBeInTheDocument();
  });
});
