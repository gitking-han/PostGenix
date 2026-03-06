import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    // If no token, send them to login
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  
  if (token) {
    // If already logged in, don't let them see Login/Signup, send to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};