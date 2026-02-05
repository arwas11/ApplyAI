import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar' // Use the alias '@' if possible
import { AuthProvider } from '@/context/AuthContext'

// 1. MOCK: Intercept the import
// Note: The path here must match what Navbar.tsx uses internally!
jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// 2. IMPORT: Get the mocked function so we can control it
import { useAuth } from '@/context/AuthContext'

describe('Navbar Component', () => {
  
  it('renders "Sign In" when user is NOT logged in', () => {
    // ARRANGE: Tell the mock to return null (Logged Out)
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      signIn: jest.fn(),
      logOut: jest.fn(),
    });

    // ACT
    render(<Navbar />);

    // ASSERT
    // Using regex /.../i to match "Sign In with Google" case-insensitively
    const button = screen.getByRole('button', { name: /Sign In with Google/i });
    expect(button).toBeInTheDocument();
  });

  it('renders "Sign Out" when user IS logged in', () => {
    // ARRANGE: Tell the mock to return a user object
    (useAuth as jest.Mock).mockReturnValue({
      user: { displayName: "Test User", email: "test@example.com" },
      signIn: jest.fn(),
      logOut: jest.fn(),
    });

    // ACT
    render(<Navbar />);

    // ASSERT
    const button = screen.getByRole('button', { name: /Sign Out/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });
});