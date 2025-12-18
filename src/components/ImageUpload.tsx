import { useState, useRef } from "react";
import { Upload, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelect(file, e.target?.result as string);
    };
    reader.readAsDataURL(file);
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
    <div className={cn("space-y-3", className)}>
      {/* Hidden inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Three minimalist buttons */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGalleryClick}
          className="w-full h-14 border-serene-sand hover:border-secondary hover:bg-serene-sand/10 text-primary font-medium"
        >
          <Upload className="w-5 h-5 mr-3 text-secondary" />
          Upload de foto
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleCameraClick}
          className="w-full h-14 border-serene-sand hover:border-secondary hover:bg-serene-sand/10 text-primary font-medium"
        >
          <Camera className="w-5 h-5 mr-3 text-secondary" />
          Tirar foto
        </Button>

        {onSkip && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Switch
              id="skip-photo"
              checked={skipPhoto}
              onCheckedChange={onSkip}
              className="data-[state=checked]:bg-green-600"
            />
            <Label
              htmlFor="skip-photo"
              className={`text-sm cursor-pointer transition-colors ${skipPhoto ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}
            >
              Prosseguir sem foto
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}
