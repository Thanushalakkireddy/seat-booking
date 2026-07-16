import { Navigate } from 'react-router-dom';

function isAuthenticated() {
  try {
    const token = localStorage.getItem("token");
    if (!token || token.trim() === '' || token.length < 50) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const decodedToken = JSON.parse(jsonPayload);

    if (decodedToken.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        return false;
      }
    }

    if (!decodedToken.role || (decodedToken.role !== 'admin' && decodedToken.role !== 'user')) {
      return false;
    }

    if (!decodedToken.id && !decodedToken.email) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

function getRoleFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload).role;
  } catch (error) {
    console.error('Error decoding token from cookie:', error);
    return null;
  }
}

export default function GuestRoute({ children }) {
  const isAuth = isAuthenticated();
  const userRole = getRoleFromToken();
  const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard';
  if (isAuth) {
    return <Navigate to={dashboardPath} replace />;
  }
  return children;
}
