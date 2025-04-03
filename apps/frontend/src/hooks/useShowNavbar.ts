import { useEffect, useState } from "react";

export const useShowNavbar = () => {
  const [showBackground, setShowBackground] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 50) {
        setShowBackground(false);
      } else {
        setShowBackground(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { showBackground };
};
