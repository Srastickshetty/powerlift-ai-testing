import { useAuth } from "../auth/authContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <div>Please login</div>;
  if (role && user.role !== role) return <div>Access denied</div>;

  return children;
}
