"use client";

import Image from "next/image";
import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackSrc?: string;
}

export function SafeImage({ 
  src, 
  alt, 
  width, 
  height, 
  fill, 
  className,
  fallbackSrc = "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Image"
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Replace any /api/placeholder URLs with working ones
  const safeSrc = imageSrc.includes("/api/placeholder") 
    ? fallbackSrc 
    : imageSrc;

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  if (fill) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        fill
        className={className}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      onError={handleError}
    />
  );
}
