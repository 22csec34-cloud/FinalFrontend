import { useState, useCallback } from "react";

import { toast } from "sonner";

export interface GeneratedImage {
  id: string;
  label: string;
  description: string;
  url: string | null;
  date?: string;
  viewType?: string;
}

const defaultImages: GeneratedImage[] = [
  { id: "front", label: "Front View", description: "Full-body, facing forward", url: null },
  { id: "left", label: "Left View", description: "90° left side profile", url: null },
  { id: "back", label: "Back View", description: "Facing backward", url: null },
  { id: "outfit", label: "Outfit Only", description: "Transparent background", url: null },
];

type ViewType = "front" | "left" | "back" | "outfit";

export function useOutfitGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(defaultImages);
  const [currentView, setCurrentView] = useState<ViewType | null>(null);

  const generateSingleView = useCallback(async (
    userImage: string,
    outfitDescription: string,
    viewType: ViewType
  ): Promise<string | null> => {
    try {
      // Use local backend instead of Supabase
      const response = await fetch('http://localhost:5000/api/generate-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ userImage, outfitDescription, viewType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.imageUrl;
    } catch (error) {
      console.error(`Failed to generate ${viewType}:`, error);
      return null;
    }
  }, []);

  const generateAllViews = useCallback(async (
    userImage: string,
    outfitDescription: string
  ) => {
    setIsGenerating(true);
    setGeneratedImages(defaultImages);

    const viewTypes: ViewType[] = ["front", "left", "back", "outfit"];

    for (const viewType of viewTypes) {
      setCurrentView(viewType);
      toast.info(`Generating ${viewType} view...`);

      const imageUrl = await generateSingleView(userImage, outfitDescription, viewType);

      if (imageUrl) {
        setGeneratedImages((prev) =>
          prev.map((img) =>
            img.id === viewType ? { ...img, url: imageUrl } : img
          )
        );
        toast.success(`${viewType.charAt(0).toUpperCase() + viewType.slice(1)} view complete!`);
      } else {
        toast.error(`Failed to generate ${viewType} view`);
      }
    }

    setCurrentView(null);
    setIsGenerating(false);
    toast.success("All views generated!");
  }, [generateSingleView]);

  const resetImages = useCallback(() => {
    setGeneratedImages(defaultImages);
  }, []);

  return {
    isGenerating,
    generatedImages,
    currentView,
    generateAllViews,
    resetImages,
  };
}
