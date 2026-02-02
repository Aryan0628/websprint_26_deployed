import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
// Adjust the path based on where your components folder is. 
// If this file is in src/auth, you likely need to go up one level (../)
import CircularText from "../components/CircularText"; 

const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    
    const namespace = "https://urbanflow/roles"; 
    const roles = user?.[namespace] || [];
    
    if (roles.includes("staff-fire")) {
      navigate("/staff/fire");
    } 
    else if (roles.includes("staff-waste")) {
      navigate("/staff/waste");
    }
    else if (roles.includes("staff-infra")){
        navigate("/staff/infra");
    }
    else if (roles.includes("staff-water")){
        navigate("/staff/water");
    }
    else if (roles.includes("staff-electricity")){
        navigate("/staff/electricity");
    }
    else if (roles.includes("administration")){
        navigate("/administration");
    }
    else if (roles.includes("infrastructure")){
        navigate("/administration/municipal/infrastructure");
    }
    else if (roles.includes("water")){
        navigate("/administration/municipal/water");
    }
    else if (roles.includes("waste")){
        navigate("/administration/municipal/waste");
    }
    else if (roles.includes("electricity")){
        navigate("/administration/municipal/electricity");
    }
    else if (roles.includes("fire")){
        navigate("/administration/municipal/fire");
    }
    else {
      navigate("/dashboard");
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  return (
    // Same styling as App.jsx for consistency
    <div className="flex items-center justify-center h-screen w-full bg-gray-900">
      <CircularText
        text="REDIRECTING*...*URBAN*FLOW*" 
        onHover="speedUp"
        spinDuration={20}
        className="custom-class text-blue-400"
      />
    </div>
  );
};

export default RoleBasedRedirect;