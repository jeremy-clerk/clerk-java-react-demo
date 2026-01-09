import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Clerk + Java Demo
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          <SignedIn>
            <Link to="/dashboard">Dashboard</Link>
          </SignedIn>
        </nav>
        <div className="auth-buttons">
          <SignedOut>
            <SignInButton>
              <button className="btn btn-secondary">Sign In</button>
            </SignInButton>
            <SignUpButton>
              <button className="btn btn-primary">Sign Up</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default Header;
