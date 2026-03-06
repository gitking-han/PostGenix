"use client";

import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface Props {
  image: string;
  aspect: number;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
  title: string;
}

export function ImageCropperModal({ image, aspect, isOpen, onClose, onCropComplete, title }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropDone = async () => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = image;
    
    await new Promise((resolve) => (img.onload = resolve));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    onCropComplete(canvas.toDataURL("image/jpeg", 0.8));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-64 bg-black mt-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>
        <div className="py-4 space-y-2">
          <p className="text-xs text-muted-foreground text-center">Drag to reposition • Scroll to zoom</p>
          <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(v) => setZoom(v[0])} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onCropDone}>Save Selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}