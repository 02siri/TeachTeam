// import { render, screen } from "@testing-library/react";
// import Home from "@/pages/index";
// import { useAuth } from "@/context/AuthLogic";

// //mock Next.js components
// jest.mock("next/image", () => ({
//   __esModule: true,
//   default: (props: any) => <img {...props} alt="mocked image" />,
// }));

// //mock Link component..
// jest.mock("next/link", () => ({
//   __esModule: true,
//   default: ({ children }: any) => <>{children}</>,
// }));

// //mock router..
// jest.mock("next/router", () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//   }),
// }));

// //mock AuthLogic
// jest.mock("@/context/AuthLogic", () => ({
//   useAuth: jest.fn(),
// }));

// //mock ResizeObserver
// global.ResizeObserver = class {
//   observe() {}
//   unobserve() {}
//   disconnect() {}
// };

// //mock IntersectionObserver[it was an error fix]
// global.IntersectionObserver = class IntersectionObserver {
//   root: Element | null = null;
//   rootMargin: string = "";
//   thresholds: ReadonlyArray<number> = [];
//   constructor() {}
//   observe() {}
//   unobserve() {}
//   disconnect() {}
//   takeRecords(): IntersectionObserverEntry[] {
//     return [];
//   }
// };

// //mock ResponsiveContainer to avoid 0 width/height issue
// jest.mock("recharts", () => {
//   const original = jest.requireActual("recharts");
//   return {
//     ...original,
//     ResponsiveContainer: ({ children }: any) => (
//       <div style={{ width: 500, height: 300 }}>{children}</div>
//     ),
//   };
// });


// //mock Chakra UI components..[error fix]
// global.ResizeObserver = class {
//   observe() {}
//   unobserve() {}
//   disconnect() {}
// };

// //mock IntersectionObserver for testing
// global.IntersectionObserver = class {
//   root: Element | null = null;
//   rootMargin: string = "";
//   thresholds: ReadonlyArray<number> = [];
//   observe() {}
//   unobserve() {}
//   disconnect() {}
//   takeRecords(): IntersectionObserverEntry[] {
//     return [];
//   }
// };



// describe("Home Page Graphs & Stats", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("renders all chart titles correctly when user is not logged in", () => {
//     (useAuth as jest.Mock).mockReturnValue({ user: null });

//     render(<Home />);

//     //application Stats
//     expect(screen.getByText(/Application Statistics/i)).toBeInTheDocument();
//     expect(screen.getByText(/Roles Chosen/i)).toBeInTheDocument();
//     expect(screen.getByText(/Top Skills/i)).toBeInTheDocument();
//     expect(screen.getByText(/Availability/i)).toBeInTheDocument();
//     expect(screen.getByText(/Most Applied Courses/i)).toBeInTheDocument();

//     //lecturer Stats
//     expect(screen.getByText(/Lecturer Insights/i)).toBeInTheDocument();
//     expect(screen.getByText("Most Hired Courses")).toBeInTheDocument();
//   });
// });
