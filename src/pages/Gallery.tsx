import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStorage } from "@/context/StorageContext";
import { Sparkles, Trash2, Camera, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

const Gallery = () => {
    const { savedImages, deleteImageSet, addToCart } = useStorage();
    const [launchingTryOn, setLaunchingTryOn] = useState<string | null>(null);

    // Intelligent Grouping Logic
    // Merges sets based on description + time window to handle duplicates/split sets
    const groupedSets = savedImages.reduce((acc: any, img) => {
        // Create a time bucket (round to nearest 5 minutes)
        const timestamp = img.date ? new Date(img.date).getTime() : 0;
        const timeBucket = Math.floor(timestamp / (5 * 60 * 1000));

        // Generate a key for grouping
        let key = img.id.split('-')[0]; // Default: use the Set ID

        // If description exists and isn't generic, use description + time as key
        // This merges separate API calls for the same generation
        if (img.description && img.description !== 'Custom outfit') {
            // Create a sanitized key from description + time
            // We use a short substring of description to be safe against minor variations
            const safeDesc = img.description.substring(0, 30).trim();
            key = `${safeDesc}-${timeBucket}`;
        }

        if (!acc[key]) {
            acc[key] = {
                // Use the ID from the first image we find as the "leader" ID for actions
                setId: img.id.split('-')[0],
                description: img.description || 'Custom outfit',
                date: img.date,
                images: []
            };
        }

        // Deduplicate images within the group
        // If an image with this URL already exists, don't add it again
        const existingIdx = acc[key].images.findIndex((existing: any) => existing.url === img.url);

        if (existingIdx === -1) {
            acc[key].images.push(img);
        } else {
            // Already exists. If the new one has better metadata (e.g. viewType), update it
            if (!acc[key].images[existingIdx].viewType && img.viewType) {
                acc[key].images[existingIdx] = img;
            }
        }

        return acc;
    }, {});

    const imageSetsArray = Object.values(groupedSets);

    const handleVirtualTryOn = async (set: any) => {
        // Find the "Outfit Only" image (usually the 4th one)
        const outfitImage = set.images.find((img: any) =>
            img.label?.toLowerCase().includes('outfit') ||
            img.viewType?.toLowerCase().includes('outfit')
        ) || set.images[set.images.length - 1]; // Fallback to last image

        if (!outfitImage?.url) {
            toast.error("Outfit image not found");
            return;
        }

        setLaunchingTryOn(set.setId);
        try {
            toast.info("Launching Virtual Try-On...");
            const response = await fetch('http://localhost:5000/api/try-on', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl: outfitImage.url }),
            });

            if (response.ok) {
                toast.success("Virtual Try-On started! Check the popup window.");
            } else {
                toast.error("Failed to start Virtual Try-On");
            }
        } catch (error) {
            console.error(error);
            toast.error("Could not connect to backend server");
        } finally {
            setLaunchingTryOn(null);
        }
    };

    const handleDelete = async (setId: string) => {
        if (confirm("Are you sure you want to delete this entire outfit set?")) {
            await deleteImageSet(setId);
        }
    };

    const handleAddToCart = (set: any) => {
        // Find the "Outfit Only" image (usually the 4th one)
        const outfitImage = set.images.find((img: any) =>
            img.label?.toLowerCase().includes('outfit') ||
            img.viewType?.toLowerCase().includes('outfit')
        ) || set.images[set.images.length - 1]; // Fallback to last image

        if (!outfitImage?.url) {
            toast.error("Outfit image not found");
            return;
        }

        addToCart({
            id: outfitImage.id,
            label: `Custom Outfit - ${set.description}`,
            image: outfitImage.url,
            price: 199
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-accent/30">
            <Header />

            <main className="flex-1 py-12 px-6">
                <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                    <div className="text-center">
                        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
                            Your <span className="text-gradient-gold">Collection</span>
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Browse your generated styles and fashion visualizations.
                        </p>
                    </div>

                    <div className="mt-12">
                        {imageSetsArray.length === 0 ? (
                            <div className="text-center py-20 bg-surface-elevated/30 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <p className="text-muted-foreground">No images generated yet.</p>
                                <a href="/generate" className="text-accent hover:underline mt-2 inline-block">
                                    start creating
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {imageSetsArray.map((set: any) => (
                                    <div
                                        key={set.key || set.setId}
                                        className="bg-surface-elevated/30 rounded-2xl border border-white/10 backdrop-blur-sm p-6 space-y-6 hover:border-accent/30 transition-all"
                                    >
                                        {/* Set Header */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-xl text-foreground mb-1">
                                                    {set.description}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {set.date ? new Date(set.date).toLocaleDateString() : 'Recently generated'}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-foreground hover:bg-transparent hover:text-accent hover:scale-110 transition-all duration-300 rounded-full"
                                                onClick={() => handleAddToCart(set)}
                                                title="Add to Cart"
                                            >
                                                <ShoppingBag className="w-7 h-7" />
                                            </Button>
                                        </div>

                                        {/* Images Row - Horizontal Scroll */}
                                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
                                            {set.images.map((img: any) => (
                                                <div
                                                    key={img.id}
                                                    className="relative flex-shrink-0 w-64 aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-surface-elevated/50 group"
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt={img.label}
                                                        className="w-full h-full object-cover"
                                                    />

                                                    {/* Label Overlay */}
                                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
                                                        <p className="text-sm font-medium text-white text-center">{img.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Buttons Row - Left, Center, Right */}
                                        <div className="grid grid-cols-3 gap-4 pt-2">
                                            {/* Left: Delete Button */}
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="gap-2 text-red-500 hover:text-red-400 border-red-500/20 hover:bg-red-500/10"
                                                onClick={() => handleDelete(set.setId)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Set
                                            </Button>

                                            {/* Center: Virtual Try On Button */}
                                            <Button
                                                variant="default"
                                                size="lg"
                                                className="gap-2 bg-gradient-to-r from-accent via-purple-500 to-violet-600 text-white font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all"
                                                onClick={() => handleVirtualTryOn(set)}
                                                disabled={launchingTryOn === set.setId}
                                            >
                                                <Camera className="w-4 h-4" />
                                                {launchingTryOn === set.setId ? 'Launching...' : 'Virtual Try On'}
                                            </Button>

                                            {/* Right: Style Suggestions Button */}
                                            <Button
                                                variant="default"
                                                size="lg"
                                                className="gap-2 bg-gradient-gold text-white hover:opacity-90 transition-opacity"
                                                onClick={() => window.location.href = `/suggestions/${set.setId}`}
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Style Suggestions
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Gallery;
