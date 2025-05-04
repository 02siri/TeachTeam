import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

//mocking Next.js Link and Image components
describe("Footer Component", () => {
  it("renders the design and development credits", () => {
    render(<Footer />);
    expect(screen.getByText(/Designed & Developed by/i)).toBeInTheDocument();
    expect(screen.getByText(/Srishti/i)).toBeInTheDocument();
    expect(screen.getByText(/Sruthy/i)).toBeInTheDocument();
  });


  //check if the footer has the correct copyright information
  it("renders the current year correctly", () => {
    const year = new Date().getFullYear();
    render(<Footer />);
    expect(
      screen.getByText(`© ${year} TeachTeam. All rights reserved.`)
    ).toBeInTheDocument();
  });


  //check if the footer has the correct classes for styling
  it("has semantic <footer> tag", () => {
    const { container } = render(<Footer />);
    const footerElement = container.querySelector("footer");
    expect(footerElement).toBeInTheDocument();
  });


  //check if the footer has the correct classes for styling
  it("uses appropriate color classes for contrast", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toMatch(/bg-gradient-to-br/);
    expect(footer?.className).toMatch(/text-white/);
  });
});


