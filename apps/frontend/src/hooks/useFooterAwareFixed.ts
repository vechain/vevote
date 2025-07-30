import { useEffect, useState } from "react";

interface FooterAwareFixedProps {
  position: "fixed" | "absolute";
  bottom?: string;
  top?: string;
  left: string;
}

export const useFooterAwareFixed = (buttonHeight: number = 100): FooterAwareFixedProps => {
  const [positioning, setPositioning] = useState<FooterAwareFixedProps>({
    position: "fixed",
    bottom: "0",
    left: "0",
  });

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById("footer");
      if (!footer) return;

      const footerOffsetTop = footer.offsetTop;
      const buttonAbsoluteTop = footerOffsetTop - buttonHeight;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const viewportBottom = scrollY + windowHeight;
      
      const shouldUseAbsolute = viewportBottom - buttonHeight >= buttonAbsoluteTop;
      
      if (shouldUseAbsolute) {
        setPositioning({
          position: "absolute",
          top: `${buttonAbsoluteTop}px`,
          left: "0",
        });
      } else {
        setPositioning({
          position: "fixed",
          bottom: "0",
          left: "0",
        });
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [buttonHeight]);

  return positioning;
};