import { useStorage } from "@/context/StorageContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Camera, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LiveTryOn = () => {
    const { savedImages } = useStorage();
    const { user } = useAuth();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleTryOn = async () => {
        if (!selectedImage) {
            toast.error("Please select an outfit first");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/try-on", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageUrl: selectedImage }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("AR Window Launched! Check your taskbar.");
            } else {
                toast.error(data.error || "Failed to launch AR");
            }
        } catch (error) {
            console.error("Try-On Error:", error);
            toast.error("Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 py-12 px-6">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold">
                            Live <span className="text-gradient-gold">AR Try-On</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Experience your generated outfits in real-time. Select a design below and launch the magical mirror.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Left: Gallery Selection */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-accent" />
                                Select Outfit
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {savedImages.length > 0 ? (
                                    savedImages.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className={`
                                                relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300
                                                ${selectedImage === img.url ? 'border-accent shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-[1.02]' : 'border-transparent hover:border-white/20'}
                                            `}
                                            onClick={() => setSelectedImage(img.url)}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.label}
                                                className="w-full h-full object-cover"
                                            />
                                            {selectedImage === img.url && (
                                                <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                                                    <div className="w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center">
                                                        <Sparkles className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                                                <p className="text-xs font-medium text-white truncate">{img.label}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center bg-surface-elevated/30 rounded-xl border border-white/5 border-dashed">
                                        <p className="text-muted-foreground mb-4">No outfits found in your gallery.</p>
                                        <Button onClick={() => navigate('/generate')} variant="outline">
                                            Generate New Outfit
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Preview & Action */}
                        <div className="sticky top-24 space-y-6">
                            <Card className="bg-surface-elevated/50 border-white/10 backdrop-blur-md overflow-hidden">
                                <CardContent className="p-6 space-y-6">
                                    <div className="aspect-[3/4] rounded-lg bg-black/20 overflow-hidden border border-white/5 flex items-center justify-center relative">
                                        {selectedImage ? (
                                            <>
                                                <img src={selectedImage} alt="Selected" className="w-full h-full object-cover opacity-50 blur-sm" />
                                                <img src={selectedImage} alt="Selected" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-auto object-contain shadow-2xl" />
                                            </>
                                        ) : (
                                            <div className="text-center p-6 grayscale opacity-50">
                                                <img src="/placeholder-outfit.png" className="w-full h-full object-contain mb-4 opacity-0" alt="" />
                                                <p className="text-muted-foreground">Select an outfit to preview</p>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-accent to-[#FDB931] text-black hover:opacity-90 transition-opacity"
                                        disabled={!selectedImage || isLoading}
                                        onClick={handleTryOn}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Launching...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-5 h-5 mr-2" />
                                                Launch Live Try-On
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        This will open a separate window accessing your webcam. Ensure your camera is connected.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LiveTryOn;
