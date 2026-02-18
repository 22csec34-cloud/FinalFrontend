import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface FavoriteSuggestion {
    suggestionId: string;
    setId: string;
    imageUrl: string;
    description: string;
    styling: string;
    accessories: string;
    occasions: string;
    savedAt: string;
}

const Favorites = () => {
    const { token } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!token) return;
            try {
                const response = await fetch('http://localhost:5000/api/user/favorites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFavorites(data.reverse()); // Show newest first
                }
            } catch (error) {
                console.error("Failed to fetch favorites", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, [token]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 py-12 px-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
                            Your <span className="text-gradient-gold">Style Favorites</span>
                        </h1>
                        <p className="text-muted-foreground">Curated looks and styling advice you love.</p>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-20">Loading...</div>
                    ) : favorites.length === 0 ? (
                        <div className="text-center py-20 bg-surface-elevated/30 rounded-2xl border border-white/5">
                            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-30" />
                            <h2 className="text-xl font-medium">No Favorites Yet</h2>
                            <p className="text-muted-foreground mt-2">Save styling suggestions to see them here.</p>
                            <Link to="/gallery" className="mt-4 inline-block text-accent hover:underline">Go to Gallery</Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map((fav) => (
                                <div key={fav.suggestionId} className="bg-surface-elevated/30 rounded-xl border border-white/10 overflow-hidden hover:border-accent/40 transition-all">
                                    <div className="aspect-[3/4] relative">
                                        <img src={fav.imageUrl} alt="Outfit" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-white font-medium truncate">{fav.description || "Saved Look"}</h3>
                                            <p className="text-xs text-white/70 mt-1 line-clamp-2">{fav.styling}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="text-sm text-muted-foreground space-y-2">
                                            <p><span className="text-accent font-medium">Wear to:</span> {fav.occasions}</p>
                                            <p><span className="text-accent font-medium">Style with:</span> {fav.accessories}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link to={`/suggestions/${fav.setId}`} className="flex-1">
                                                <Button variant="outline" className="w-full">View Details</Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Favorites;
