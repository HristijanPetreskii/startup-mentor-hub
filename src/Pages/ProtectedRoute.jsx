import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ children, allow }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null; // или спинер

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (allow && !allow.includes(user.role)) {
    // нема дозволена улога
    return <Navigate to="/" replace />;
  }
  return children;
}
