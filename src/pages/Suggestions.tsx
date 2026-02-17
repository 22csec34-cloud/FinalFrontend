import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useStorage } from "@/context/StorageContext";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles, Shirt, ShoppingBag, Calendar } from "lucide-react";
import { toast } from "sonner";

interface SuggestionsData {
    styling: string;
    accessories: string;
    occasions: string;
}

const Suggestions = () => {
    const { setId } = useParams();
    const { savedImages } = useStorage();
    const { token } = useAuth();
    const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Find the outfit images based on setId
    // savedImages are flat, so we look for any image with this ID (which we stored as setId-viewType)
    // Actually, StorageContext flattens them. We might need to reconstruct or finding one is enough to get description/context if we had it.
    // ISSUE: StorageContext flat list loses the 'setId' grouping explicitly unless we parse 'id'.
    // In StorageContext: id: `${set.setId}-${img.viewType}`.

    const relatedImages = savedImages.filter(img => img.id.startsWith(`${setId}-`));
    const mainImage = relatedImages.find(img => img.viewType === 'outfit') || relatedImages[0];

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!setId || !token) return;

            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/generate-suggestions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        setId,
                        outfitDescription: mainImage?.description || "Stylish outfit"
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    setSuggestions(data.suggestions);
                } else {
                    toast.error("Failed to load suggestions");
                }
            } catch (error) {
                console.error(error);
                toast.error("Network error");
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchSuggestions();
        }
    }, [setId, token, mainImage?.description]);

    if (!mainImage) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Outfit not found. Please try refreshing the gallery.</p>
                    <Link to="/gallery"><Button variant="link">Back to Gallery</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <Link to="/gallery" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 text-lg">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Gallery
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Left: Images */}
                        <div className="space-y-6">
                            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-accent/5 border border-white/10 relative">
                                {mainImage.url ? (
                                    <img src={mainImage.url} alt="Outfit" className="w-full h-full object-cover" />
                                ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>}
                            </div>
                        </div>

                        {/* Right: AI Suggestions */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="font-serif text-4xl font-medium mb-4">AI Stylist Recommendations</h1>
                                <p className="text-muted-foreground text-lg">
                                    Personalized advice for your generated look.
                                </p>
                            </div>

                            {isLoading ? (
                                <div className="space-y-6">
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                </div>
                            ) : suggestions ? (
                                <div className="space-y-6 animate-slide-up">
                                    {/* Styling Advice */}
                                    <div className="bg-surface-elevated/30 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:border-accent/30 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Shirt className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-serif text-xl">Styling Advice</h3>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{suggestions.styling}</p>
                                    </div>

                                    {/* Accessories */}
                                    <div className="bg-surface-elevated/30 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:border-accent/30 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-serif text-xl">Accessories</h3>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{suggestions.accessories}</p>
                                    </div>

                                    {/* Occasions */}
                                    <div className="bg-surface-elevated/30 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:border-accent/30 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-serif text-xl">Best Occasions</h3>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{suggestions.occasions}</p>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <Button className="flex-1 h-12 text-lg">Save to Favorites</Button>
                                        <Button variant="outline" className="flex-1 h-12 text-lg">Share Look</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Unable to load suggestions.</p>
                                    <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Try Again</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Suggestions;
