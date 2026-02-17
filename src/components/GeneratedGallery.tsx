import { Download, ZoomIn, Loader2, ShoppingBag, X, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStorage } from "@/context/StorageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

interface GeneratedImage {
  id: string;
  label: string;
  description: string;
  url: string | null;
}

interface GeneratedGalleryProps {
  images: GeneratedImage[];
  isGenerating: boolean;
}

const GeneratedGallery = ({ images, isGenerating }: GeneratedGalleryProps) => {
  const { addToCart, deleteImageSet } = useStorage();
  const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null);

  const handleDownload = async (url: string, label: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${label.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Image downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Download failed");
    }
  };

  const handleAddToCart = (image: GeneratedImage) => {
    if (!image.url) return;
    addToCart({
      id: image.id,
      label: image.label,
      image: image.url,
      price: 199
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            Generated Views
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            4 high-resolution outfit visualizations
          </p>
        </div>
        {images.some((img) => img.url) && (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-gradient-gold text-white hover:opacity-90 transition-opacity"
              onClick={() => {
                // Extract setId from the first image ID (format: setId-viewType)
                const firstImage = images.find(img => img.url);
                if (firstImage) {
                  const setId = firstImage.id.split('-')[0];
                  window.location.href = `/suggestions/${setId}`;
                }
              }}
            >
              <Sparkles className="w-4 h-4" />
              Get Style Suggestions
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download All
            </Button>
          </div>
        )}
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              "group relative flex flex-col gap-3",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn(
              "relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-surface-elevated/50 backdrop-blur-sm shadow-lg transition-all duration-500 hover:shadow-xl hover:border-accent/50",
              isGenerating && !image.url && "animate-pulse"
            )}>
              {isGenerating && !image.url ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                  <p className="text-xs text-muted-foreground text-center font-medium">
                    Creating Magic...
                  </p>
                </div>
              ) : image.url ? (
                <>
                  <img
                    src={image.url}
                    alt={image.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                    onClick={() => setZoomedImage(image)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Overlay Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300 pointer-events-auto">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white border-0"
                      onClick={() => handleDownload(image.url!, image.label)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white border-0"
                      onClick={() => setZoomedImage(image)}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-muted/30">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground text-center">
                    {image.label}
                  </p>
                </div>
              )}
            </div>

            {/* Below Image Info & Action */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground text-sm">{image.label}</h3>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-2">
                {image.url && (
                  <>
                    {(image.label === 'Outfit Only' || index === 3) ? (
                      <>
                        <Button
                          type="button"
                          className="w-full bg-accent hover:bg-accent/90 text-white transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-accent/20"
                          size="sm"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              toast.info("Launching Virtual Try-On...");
                              const response = await fetch('http://localhost:5000/api/try-on', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ imageUrl: image.url }),
                              });

                              if (response.ok) {
                                toast.success("Virtual Try-On started! Check the popup window.");
                              } else {
                                toast.error("Failed to start Virtual Try-On");
                              }
                            } catch (error) {
                              console.error(error);
                              toast.error("Could not connect to backend server");
                            }
                          }}
                        >
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin hidden" />
                          Try On with AR
                        </Button>
                        <Button
                          type="button"
                          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 transition-all duration-300"
                          size="sm"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this entire outfit set?")) {
                              const setId = image.id.split('-')[0];
                              await deleteImageSet(setId);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete Outfit Set
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
                        size="sm"
                        onClick={() => handleAddToCart(image)}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Style Suggestion & Cost Estimation */}
              {image.url && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <div className="bg-surface-elevated/50 p-2.5 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-accent">Trending Variation</span>
                      <span className="text-[10px] text-muted-foreground">In Stock</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/10 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-foreground">Royal Velvet {image.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">Must-have color for this season.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-elevated/50 p-2.5 rounded-lg border border-white/5 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Estimated Cost</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Premium Fabric</span>
                      <span>$120.00</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Expert Tailoring</span>
                      <span>$45.00</span>
                    </div>
                    <div className="h-px bg-white/10 my-1" />
                    <div className="flex justify-between text-sm font-medium text-foreground">
                      <span>Total</span>
                      <span>$165.00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!zoomedImage} onOpenChange={(open) => !open && setZoomedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0 shadow-none overflow-hidden flex items-center justify-center">
          <div className="relative">
            {zoomedImage && zoomedImage.url && (
              <img
                src={zoomedImage.url}
                alt={zoomedImage.label}
                className="w-auto h-[85vh] rounded-md object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full"
              onClick={() => setZoomedImage(null)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneratedGallery;
