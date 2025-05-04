import {render, screen, fireEvent} from "@testing-library/react";
import LecturerDashboard from "../pages/lecturer-dashboard";
import { AuthProvider } from "@/context/AuthLogic";
import { ChakraProvider } from "@chakra-ui/react";
import "@testing-library/jest-dom";

const LecturerRender = ()=>render(
        <AuthProvider>
            <ChakraProvider>
                <LecturerDashboard />
            </ChakraProvider>
        </AuthProvider>
);

//Mock router 
jest.mock("next/router", ()=>({
    useRouter: jest.fn(()=>({
        push: jest.fn(),
        back: jest.fn(),
        pathname: "/lecturer-dashboard",
        query: {},
        replace: jest.fn(),
        prefetch: jest.fn(),
    })),
}));

describe("Lecturer Dashboad",()=>{
    beforeEach(()=>{
        jest.clearAllMocks();
    });

    //Test: Dashboard title
    it("renders dashboard title", ()=>{
        LecturerRender();
        expect(screen.getByText(/Lecturer Dashboard/i)).toBeInTheDocument();
    });

    
    //Test: Search input fields
    it("renders search input fields", ()=>{
        LecturerRender();
        expect(screen.getByPlaceholderText(/Search by Tutor Name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search by Course Name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search by Availability/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search by Skills/i)).toBeInTheDocument();
    });

    //Test: Sort by dropdown
    it("renders Sort by dropdown", ()=>{
        LecturerRender();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.getByText("Sort by")).toBeInTheDocument();

    });

    //Test: Select Applicant button
    it("renders Select Applicants button", ()=>{
        LecturerRender();
        expect(screen.getByRole("button",{name: /Select Applicants/i})).toBeInTheDocument();

    });

    //Test: Toggles select mode when button is clicked
    it("toggles selection mode and submits selection", ()=>{
        LecturerRender();
        fireEvent.click(screen.getByText(/Select Applicants/i));
        expect(screen.getByText("Done Selecting")).toBeInTheDocument();
    });
});
