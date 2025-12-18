import { useState, useRef } from "react";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { optimizeImage, validateImageFile } from "@/lib/image-optimizer";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onSkip?: (skip: boolean) => void;
  skipPhoto?: boolean;
  preview?: string;
  onClear?: () => void;
  className?: string;
}

export function ImageUpload({ onImageSelect, onSkip, skipPhoto = false, preview, onClear, className }: ImageUploadProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Erro na imagem",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsOptimizing(true);

      // Optimize image for faster upload and processing
      const optimizedBase64 = await optimizeImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.85,
        maxSizeKB: 1024,
      });

      onImageSelect(file, optimizedBase64);
    } catch (error) {
      console.error("Image optimization error:", error);
      toast({
        title: "Erro ao processar imagem",
        description: "Tente novamente com outra imagem.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  if (preview) {
    return (
      <div className={cn("relative rounded-2xl overflow-hidden shadow-soft", className)}>
        <img
          src={preview}
          alt="Preview"
          className="w-full aspect-[3/4] object-cover"
        />
        {onClear && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm hover:bg-card rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isOptimizing}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isOptimizing}
      />

      {/* Optimizing indicator */}
      {isOptimizing && (
        <div className="flex items-center justify-center p-8 bg-surface rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
          <span className="text-sm text-muted-foreground">Otimizando imagem...</span>
        </div>
      )}

      {/* Hierarchical action buttons */}
      {!isOptimizing && (
        <div className="flex flex-col gap-4">
          {/* Primary Action: Take Photo */}
          <Button
            type="button"
            onClick={handleCameraClick}
            disabled={isOptimizing}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Camera className="w-5 h-5 mr-3" />
            Tirar foto
          </Button>

          {/* Secondary Action: Upload Photo */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGalleryClick}
            disabled={isOptimizing}
            className="w-full h-14 border-2 border-neutral-300 hover:border-neutral-400 bg-transparent text-neutral-700 hover:bg-neutral-50 font-medium rounded-xl transition-all disabled:opacity-50"
          >
            <Upload className="w-5 h-5 mr-3" />
            Upload de foto
          </Button>

          {/* Escape Action: Skip Photo */}
          {onSkip && (
            <button
              type="button"
              onClick={() => onSkip(!skipPhoto)}
              disabled={isOptimizing}
              className="mt-2 text-neutral-500 hover:text-neutral-700 hover:underline font-normal text-base transition-all cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
            >
              Prosseguir sem foto
            </button>
          )}
        </div>
      )}
    </div>
  );
}
