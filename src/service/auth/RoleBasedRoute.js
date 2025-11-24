// RoleBasedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleBasedRoute;
