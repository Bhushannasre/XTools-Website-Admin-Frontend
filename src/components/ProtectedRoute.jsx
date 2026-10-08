import { Navigate } from "react-router-dom";

// Wraps any route that requires a logged-in admin. Redirects to /login
// if there's no stored token.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
