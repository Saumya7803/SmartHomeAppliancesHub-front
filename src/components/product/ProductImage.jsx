import { useState } from "react";

export default function ProductImage({ src, fallbackSrc, alt, className, ...props }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc || "");

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return <img src={currentSrc} alt={alt} className={className} onError={handleError} {...props} />;
}
