import { useState, useCallback } from "react";
import { Upload, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
}

const ImageUploader = ({ onImageUpload, uploadedImage, onClear }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  if (uploadedImage) {
    return (
      <div className="relative group animate-scale-in">
        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-surface-sunken border border-border">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={onClear}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="absolute bottom-3 left-3 right-3 bg-primary/80 backdrop-blur-sm rounded-md py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-primary-foreground text-xs text-center">
            Click × to change image
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative aspect-[3/4] rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer group",
        isDragging
          ? "border-accent bg-accent/5 scale-[1.02]"
          : "border-border hover:border-accent/50 bg-surface-sunken"
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300",
          isDragging ? "bg-accent/20" : "bg-muted group-hover:bg-accent/10"
        )}>
          {isDragging ? (
            <Upload className="w-8 h-8 text-accent animate-bounce" />
          ) : (
            <User className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
          )}
        </div>
        
        <h3 className="font-serif text-xl font-medium text-foreground mb-2">
          Upload Your Photo
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Full-body image recommended for best results
        </p>
        <p className="text-xs text-muted-foreground/70">
          Drag & drop or click to browse
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
