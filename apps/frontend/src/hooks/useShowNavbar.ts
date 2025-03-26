import { useEffect, useState, useRef, RefObject } from "react";

export const useShowNavbar = ({ elementRef }: { elementRef: RefObject<HTMLDivElement> | null | undefined }) => {
  const [showBackground, setShowBackground] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const yOldRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const triggerHeight = elementRef?.current?.clientHeight || 0;

      setShowBackground(scrollY > triggerHeight);

      const yOld = yOldRef.current;
      const scrollQty = Math.abs(scrollY - yOld);
      const scrollWay = scrollY > yOld ? "down" : "up";

      if (scrollQty > 50 && scrollWay === "down") {
        setShowHeader(false);
      } else if (scrollQty > 30 && scrollWay === "up") {
        setShowHeader(true);
      }

      if (scrollQty > 50) {
        yOldRef.current = scrollY;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [elementRef]);

  return { showBackground, showHeader };
};
