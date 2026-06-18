import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../authUser';

export default function ProtectedRoute({ children, role }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <div style={{ padding: 20 }}>Access denied.</div>;
  }

  return children;
}
