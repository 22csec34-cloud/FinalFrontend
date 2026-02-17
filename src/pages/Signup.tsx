import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");

    // Measurements State
    const [shirtSize, setShirtSize] = useState("");
    const [pantSize, setPantSize] = useState("");
    const [shoeSize, setShoeSize] = useState("");
    const [wrist, setWrist] = useState("");
    const [chest, setChest] = useState("");
    const [waist, setWaist] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        const measurements = {
            shirtSize, pantSize, shoeSize, wrist, chest, waist
        };

        try {
            const response = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, height, weight, name, measurements }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Signup failed");
            }

            login(data.token, data.user);
            // toast success handled by login context or show specific message here if needed
            toast.success("Account created successfully!");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-2xl space-y-8 bg-surface-elevated/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-serif font-medium text-foreground">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Start your fashion journey today
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-muted-foreground border-b border-white/10 pb-2">Basic Info</h3>
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <div>
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <div>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <div>
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-muted-foreground border-b border-white/10 pb-2">Measurements</h3>
                            <div className="flex gap-4">
                                <Input
                                    type="text"
                                    placeholder="Height (e.g. 5'10)"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="bg-background/50"
                                />
                                <Input
                                    type="text"
                                    placeholder="Weight (e.g. 70kg)"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Input
                                    type="text"
                                    placeholder="Shirt Size (S, M, L...)"
                                    value={shirtSize}
                                    onChange={(e) => setShirtSize(e.target.value)}
                                    className="bg-background/50"
                                />
                                <Input
                                    type="text"
                                    placeholder="Pant Size (e.g. 32)"
                                    value={pantSize}
                                    onChange={(e) => setPantSize(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Input
                                    type="text"
                                    placeholder="Shoe Size"
                                    value={shoeSize}
                                    onChange={(e) => setShoeSize(e.target.value)}
                                    className="bg-background/50"
                                />
                                <Input
                                    type="text"
                                    placeholder="Wrist (in)"
                                    value={wrist}
                                    onChange={(e) => setWrist(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Input
                                    type="text"
                                    placeholder="Chest (in)"
                                    value={chest}
                                    onChange={(e) => setChest(e.target.value)}
                                    className="bg-background/50"
                                />
                                <Input
                                    type="text"
                                    placeholder="Waist (in)"
                                    value={waist}
                                    onChange={(e) => setWaist(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-white mt-8"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating account..." : "Sign up"}
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link to="/login" className="font-medium text-accent hover:text-accent/80">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
