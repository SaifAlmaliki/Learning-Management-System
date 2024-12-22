import { useState, useEffect } from "react";
// Import React hooks: useState for state management and useEffect for side effects.

interface UseCarouselProps {
  totalImages: number; // Number of images in the carousel.
  interval?: number; // Optional interval duration for auto-rotation (in milliseconds).
}

// Define the `useCarousel` custom hook.
export const useCarousel = ({
  totalImages, // Total number of images in the carousel.
  interval = 5000, // Default interval for image rotation is 5 seconds.
}: UseCarouselProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  // State to track the index of the current image being displayed.

  useEffect(() => {
    // Effect to handle automatic image rotation.

    const timer = setInterval(() => {
      // Set an interval to update the current image index periodically.
      setCurrentImage((prev) => (prev + 1) % totalImages);
      // Update the current image index in a circular manner:
      // If the index reaches the last image, it wraps around to the first image.
    }, interval);

    return () => clearInterval(timer);
    // Cleanup function to clear the timer when the component unmounts or dependencies change,
    // preventing memory leaks.
  }, [totalImages, interval]);
  // Dependencies: Re-run the effect whenever `totalImages` or `interval` changes.

  return currentImage;
  // Return the current image index so it can be used in the component.
};
