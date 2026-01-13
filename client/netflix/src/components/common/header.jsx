import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

function isAuthenticated() {
  try {
    const token = localStorage.getItem("token");

    // Check if token exists and is not empty
    if (!token || token.trim() === '' || token.length < 50) return false; // Increased minimum length

    // Try to decode the token to see if it's valid
    const parts = token.split('.');
    if (parts.length !== 3) return false; // JWT should have 3 parts

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

    // Check if token has expired (if it has an exp field)
    if (decodedToken.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        return false; // Token has expired
      }
    }

    // Ensure the token has a valid role field (must be 'admin' or 'user')
    if (!decodedToken.role || (decodedToken.role !== 'admin' && decodedToken.role !== 'user')) {
      return false; // Invalid role means invalid token
    }

    // Additional check: verify that the token has other expected fields
    if (!decodedToken.id && !decodedToken.email) {
      return false; // Likely not a proper authentication token
    }

    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export default function Header() {
  const [authState, setAuthState] = useState(isAuthenticated());
  const userRole = getRoleFromToken();
  const dashboardPath = userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard';
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication state on component mount and when location changes
  useEffect(() => {
    const currentAuth = isAuthenticated();
    setAuthState(currentAuth);
  }, [location]);

  // On initial load, make sure auth state is properly set and clear any invalid tokens
  useEffect(() => {
    // Aggressive cleanup of potential zombie cookies to prevent cross-port leakage
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    const currentAuth = isAuthenticated();
    setAuthState(currentAuth);
    
    // If there was an invalid token, ensure state reflects reality
    if (!currentAuth && authState) {
      setAuthState(false);
    }
  }, []);

  const handleSignOut = () => {
    // Clear the token from localStorage
    localStorage.removeItem("token");
    // Clear any potential zombie cookies to ensure isolation
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Update auth state
    setAuthState(false);
    // Navigate to sign in page
    navigate('/');
  };

  return (
    <div className=" bg-gray-900 px-3 py-1">
      <div className="flex items-center justify-between">
        {/* Logo Col */}
        <div className="">
          <h1 className="text-red-500 text-[35px] font-bold ">Book My Show</h1>
        </div>
        {/* Language Col */}
        <div >
          <select  className="text-white border border-white text-sm
            rounded-sm flex-right px-2 mr-3">
            <option>English</option>
            <option>Hindi</option>
          </select>
          {authState ? (
            <>
              <Link to={dashboardPath}>
                <button className="bg-red-500 text-white rounded-sm px-3">
                  Dashboard
                </button>
              </Link>
              <button 
                onClick={handleSignOut}
                className="bg-red-500 text-white rounded-sm px-3 ml-3"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/">
              <button className="bg-red-500 text-white rounded-sm px-3">
                Sign In
              </button>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}