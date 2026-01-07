
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TechBackground from "./animations/TechBackground";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  // Determine which background variant to use based on the current path
  const getBackgroundVariant = () => {
    const path = location.pathname;
    if (path === "/") return "commandCenter";
    if (path === "/about") return "defenseScientist";
    if (path === "/projects") return "weaponsInterface";
    if (path === "/resume") return "commandCenter";
    if (path === "/contact") return "satelliteCommunication";
    return "commandCenter";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TechBackground variant={getBackgroundVariant() as "commandCenter" | "defenseScientist" | "weaponsInterface" | "missionBriefing" | "satelliteCommunication"} />
      <Navbar />
      <main className="flex-grow pt-16 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
