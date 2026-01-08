import { motion } from "framer-motion";
import SectionContainer from "@/components/SectionContainer";
import AdminPanel from "@/components/AdminPanel";
import { Shield, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Simple admin access (in production, use proper auth)
const ADMIN_PASSWORD = "portfolio2024"; // Change this!

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError("");
        } else {
            setError("Invalid password");
        }
    };

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                >
                    <SpotlightCard glowColor="blue">
                        <Card className="w-full max-w-md glass-card">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-brand-blue" />
                                </div>
                                <CardTitle>Admin Access</CardTitle>
                                <CardDescription>
                                    Enter the admin password to manage your portfolio
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="Enter admin password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                    />
                                    {error && (
                                        <p className="text-sm text-destructive">{error}</p>
                                    )}
                                </div>
                                <RainbowButton onClick={handleLogin} className="w-full gap-2">
                                    <Lock className="w-4 h-4" />
                                    Access Admin Panel
                                </RainbowButton>
                            </CardContent>
                        </Card>
                    </SpotlightCard>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <motion.div
                className="relative pt-24 pb-8 md:pt-32 md:pb-16 overflow-hidden"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-brand-blue/5" />
                </div>

                <div className="container mx-auto px-6 md:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Portfolio Admin
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Manage your auto-updating portfolio data sources
                        </p>
                    </div>
                </div>
            </motion.div>

            <SectionContainer>
                <AdminPanel />
            </SectionContainer>
        </>
    );
}
