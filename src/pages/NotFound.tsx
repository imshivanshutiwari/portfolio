
import { RainbowButton } from "@/components/ui/rainbow-button";
import { AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <a href="/">
          <RainbowButton>Return to Homepage</RainbowButton>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
