import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import OutfitInput from "@/components/OutfitInput";
import GenerateButton from "@/components/GenerateButton";
import GeneratedGallery from "@/components/GeneratedGallery";
import { useOutfitGeneration } from "@/hooks/useOutfitGeneration";
import { useStorage } from "@/context/StorageContext";
import { toast } from "sonner";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [outfitDescription, setOutfitDescription] = useState("");
  const { isGenerating, generatedImages, generateAllViews, resetImages } = useOutfitGeneration();
  const { saveImageSet } = useStorage();

  // Effect to save images when generation completes
  const [hasSaved, setHasSaved] = useState(false);

  // Effect to save images when generation completes
  useEffect(() => {
    // Check if generation finished (images exist and not generating)
    if (!isGenerating && generatedImages.some(img => img.url) && !hasSaved) {
      // Check if all images have URLs before saving
      const allComplete = generatedImages.every(img => img.url);
      if (allComplete) {
        // Save as a complete set
        saveImageSet(generatedImages, outfitDescription).then(() => {
          setHasSaved(true);
        }).catch(err => {
          console.error('Failed to save image set:', err);
        });
      }
    }
  }, [isGenerating, generatedImages, outfitDescription, saveImageSet, hasSaved]);

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast.error("Please upload a full-body image first");
      return;
    }
    if (!outfitDescription.trim()) {
      toast.error("Please describe the outfit you want to visualize");
      return;
    }

    setHasSaved(false);
    await generateAllViews(uploadedImage, outfitDescription);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    resetImages();
  };

  const isReadyToGenerate = uploadedImage && outfitDescription.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/30">
      <Header />

      <main className="flex-1">
        {/* Hero Section with subtle background gradient */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-accent/5 to-transparent opacity-70" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
            <div className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-6 backdrop-blur-sm">
              <span className="text-xs font-medium text-accent tracking-wider uppercase">AI-Powered Fashion Studio</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-medium text-foreground mb-6 tracking-tight leading-tight">
              Curate Your <span className="text-gradient-gold italic">Signature</span> Look
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the future of fashion. Upload your photo and describe your dream outfit to see it come to life in seconds.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 pb-24">
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-12 mb-24 items-start">
            {/* Left Column - Input */}
            <div className="lg:col-span-5 space-y-8 animate-slide-up sticky top-6" style={{ animationDelay: "100ms" }}>
              <div className="bg-surface-elevated/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-lg">1</div>
                  <h2 className="font-serif text-2xl font-medium text-foreground">
                    Upload Photo
                  </h2>
                </div>
                <ImageUploader
                  onImageUpload={setUploadedImage}
                  uploadedImage={uploadedImage}
                  onClear={handleClearImage}
                />
              </div>
            </div>

            {/* Right Column - Description & Generate */}
            <div className="lg:col-span-7 space-y-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="bg-surface-elevated/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-lg">2</div>
                  <h2 className="font-serif text-2xl font-medium text-foreground">
                    Describe & Design
                  </h2>
                </div>

                <div className="flex-1 space-y-6">
                  <OutfitInput
                    value={outfitDescription}
                    onChange={setOutfitDescription}
                  />

                  <div className="pt-2">
                    <GenerateButton
                      onClick={handleGenerate}
                      isGenerating={isGenerating}
                      disabled={!isReadyToGenerate}
                    />
                    {!isReadyToGenerate && (
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        {!uploadedImage
                          ? "Upload an image to unlock generation"
                          : "Describe your vision to continue"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <section className="animate-slide-up mb-24" style={{ animationDelay: "300ms" }}>
            <GeneratedGallery
              images={generatedImages}
              isGenerating={isGenerating}
            />
          </section>

          {/* Features Section */}
          <section>
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl font-medium text-foreground mb-4">
                Designed for Excellence
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Professional tools for personal styling and commercial visualization.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "E-Commerce Ready",
                  description: "High-resolution outputs suitable for product listings and lookbooks.",
                },
                {
                  title: "360° Visualization",
                  description: "Generate consistent multi-angle views for a complete understanding.",
                },
                {
                  title: "Style Consistency",
                  description: "Advanced algorithms ensure fabric and texture fidelity across renders.",
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="p-8 rounded-2xl border border-white/10 bg-surface-elevated/50 hover:bg-surface-elevated hover:border-accent/30 transition-all duration-300 animate-fade-in group"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <h3 className="font-serif text-xl font-medium text-foreground mb-3 group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
