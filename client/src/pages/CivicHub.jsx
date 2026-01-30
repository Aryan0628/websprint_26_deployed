import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "../store/useAuthStore.js"; 
import FloatingLines from "../ui/FloatingLines.jsx";      
import PixelCard from "../ui/PixelCard.jsx";
import logo from "../ui/logo.png";
import NotificationFeed from "../components/NotificationFeed.jsx";
import { 
  LogOut, 
  Shield, 
  Briefcase, 
  Heart,
  Landmark,
  Bell,
  X 
} from "lucide-react";

const FEATURES = [
  {
    id: "women-safety",
    title: "SisterHood",
    description: "Navigate with confidence using AI-driven safe routes, real-time tracking, and instant SOS alerts.",
    route: "/sisterhood",
    icon: Shield,
    color: "pink"
  },
  {
    id: "reports",
    title: "Civic Connect",
    description: "Submit grievances related to infrastructure, electricity, water, and waste management",
    route: "/reports",
    icon: Landmark,
    color: "blue"
  },
  {
    id: "jobs",
    title: "StreetGig",
    description: "Empower your livelihood by finding verified local job opportunities matched to your skills.",
    route: "/streetgigs",
    icon: Briefcase,
    color: "blue"
  },
  {
    id: "ngo",
    title: "KindShare",
    description: "Bridge the gap between communities and NGOs for faster, more effective social impact.",
    route: "/kindshare",
    icon: Heart,
    color: "yellow"
  }
];

export default function App() {
  const navigate = useNavigate();
  const { user: auth0User, logout } = useAuth0();
  const { setUser, user: storedUser } = useAuthStore();
  
  // State for toggling the notification panel
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (auth0User && !storedUser) {
      setUser(auth0User);
    }
  }, [auth0User, storedUser, setUser]);

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <div className="relative h-screen w-full bg-slate-950 text-white font-sans flex flex-col overflow-hidden selection:bg-purple-500/30">
      
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FloatingLines 
          pixelSize={4}
          patternScale={5}
          color="#4c1d95" 
          backgroundColor="#020617" 
        />
      </div>

      {/* HEADER */}
      <header className="relative z-50 w-full h-20 px-6 md:px-10 flex items-center justify-between bg-black/10 backdrop-blur-md border-b border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-4 select-none">
          <img 
            src={logo} 
            alt="UrbanFlow Logo" 
            className="h-12 w-auto object-contain"
          />
          <h1 className="text-2xl font-black tracking-tighter text-white">
            Urban<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Flow</span>
          </h1>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-4">
          
          {storedUser && (
            <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md transition-colors hover:bg-white/10">
              <img 
                src={storedUser?.picture} 
                alt="Profile" 
                className="w-7 h-7 rounded-full border border-white/20" 
              />
              <span className="text-sm font-bold text-gray-200">{storedUser?.name}</span>
            </div>
          )}

          {/* NOTIFICATION SECTION */}
          <div className="relative" ref={notificationRef}>
            {/* Bell Button */}
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`p-2.5 rounded-full border transition-all active:scale-95 ${
                isNotificationOpen 
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300" 
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-14 w-80 sm:w-96 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5 backdrop-blur-md">
                  <h3 className="font-bold text-sm text-gray-200">Notifications</h3>
                  <button 
                    onClick={() => setIsNotificationOpen(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* The Existing Feed Component */}
                <div className="max-h-[400px] overflow-y-auto">
                   <NotificationFeed  limit={5}/>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => logout({ returnTo: window.location.origin })}
            className="group p-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT (Grid Layout) */}
      <main className="flex-1 relative z-10 p-6 md:p-10 flex flex-col items-center overflow-y-auto">
        
        {/* Subheader */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
             Explore Features
           </h2>
           <p className="text-zinc-400 max-w-xl mx-auto">
             Access AI-powered tools designed to improve urban living, safety, and community connection.
           </p>
        </div>

        {/* The Grid */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
           {FEATURES.map((feature) => (
             <PixelCard 
               key={feature.id} 
               variant={feature.color}
               className="w-full aspect-[4/5] cursor-pointer hover:scale-[1.02] transition-transform duration-300 bg-zinc-900/40"
               onClick={() => navigate(feature.route)}
             >
                <div className="relative z-10 flex flex-col items-center text-center p-8 h-full justify-center gap-6 pointer-events-none">
                    <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl`}>
                        <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                            {feature.description}
                        </p>
                    </div>
                </div>
             </PixelCard>
           ))}
        </div>
      </main>
    </div>
  );
}