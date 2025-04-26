import {render, screen, fireEvent} from "@testing-library/react";
import LoginPage from "../pages/login";
import { useAuth } from "@/context/AuthLogic";
import { useRouter } from "next/router";
import { ChakraProvider } from "@chakra-ui/react";
import { disconnect } from "process";

const LoginRender = () => render(
    <ChakraProvider>
        <LoginPage />
    </ChakraProvider>
);

//Mock router 
jest.mock("next/router", ()=>({
    useRouter: jest.fn(),
}));

//Mock auth logic
jest.mock("@/context/AuthLogic", ()=> ({
    useAuth: jest.fn(),
}));

describe("Login Page", ()=>{
    const mockLogin = jest.fn();
    const pushMock = jest.fn();

    beforeAll(()=>{
        global.IntersectionObserver = class{
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    });
    
    beforeEach(()=>{
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({login: mockLogin});
        (useRouter as jest.Mock).mockReturnValue({push: pushMock}); 
    });

    //Test: Render input fields and button
    it("renders sign-in form inputs and button", ()=>{
        LoginRender();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", {name:/Sign In/i})).toBeInTheDocument();

    });

    //Test: Invalid email triggers validation error
    it("validates email format",()=>{
        LoginRender();
        fireEvent.change(screen.getByLabelText(/Email/i), {target:{value:"srishti@gmail.com"}});
        fireEvent.click(screen.getByRole("button", {name:/Sign In/i}));
        expect(screen.getByText(/Please enter a valid RMIT email/i)).toBeInTheDocument();
    });

    //Test: Invalid password triggers validation error
    it("validates passeord rules",()=>{
        LoginRender();
        fireEvent.change(screen.getByLabelText(/Email/i), {target:{value:"sample@student.rmit.edu.au"}});
        fireEvent.change(screen.getByLabelText(/Password/i), {target:{value:"short11"}});
        fireEvent.click(screen.getByRole("button", {name:/Sign In/i}));
        expect(screen.getByText(/Please enter a valid password ./i)).toBeInTheDocument();
    });

    //Test: Calls login with correct credentials and redirects to main page if successfull
    it("calls login with correct credentials and redirects to main page on success",()=>{
        mockLogin.mockReturnValue(true);
        LoginRender();
        fireEvent.change(screen.getByLabelText(/Email/i), {target:{value:"srishti@student.rmit.edu.au"}});
        fireEvent.change(screen.getByLabelText(/Password/i), {target:{value:"Sk1234#abc"}});
        fireEvent.click(screen.getByRole("button", {name:/Sign In/i}));
        expect(mockLogin).toHaveBeenCalled();
        expect(pushMock).toHaveBeenCalledWith("/");
    });

    //Test: Shows error message when login fails 
    it("calls login with incorrect credentials and shows login error on failure",()=>{
        mockLogin.mockReturnValue(false);
        LoginRender();
        fireEvent.change(screen.getByLabelText(/Email/i), {target:{value:"sam@student.rmit.edu.au"}});
        fireEvent.change(screen.getByLabelText(/Password/i), {target:{value:"Sk1234#abc"}});
        fireEvent.click(screen.getByRole("button", {name:/Sign In/i}));
        expect(screen.getByText(/Invalid email or password./i)).toBeInTheDocument();
    });

    //Test: (Edge Case) : Submit empty login form
    it("displays error if login fields are empty",()=>{
        LoginRender();
        fireEvent.click(screen.getByRole("button", {name:/Sign In/i}));
        expect(screen.getByText(/Please enter a valid RMIT email/i)).toBeInTheDocument();
       
    });
});