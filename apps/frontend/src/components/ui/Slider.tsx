import { Box, HStack, Grid, GridItem } from "@chakra-ui/react";
import { motion, PanInfo } from "framer-motion";
import { ReactNode, useState, useRef, useEffect, useCallback } from "react";

interface SliderProps {
  children: ReactNode[];
  showDots?: boolean;
  gap?: number;
  className?: string;
}

const MotionGrid = motion(Grid);

export const Slider = ({ children, showDots = true, gap = 4, className }: SliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = slideWidth * 0.2;

      if (info.offset.x > threshold && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (info.offset.x < -threshold && currentIndex < children.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    [currentIndex, children.length, slideWidth],
  );

  const slideToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setSlideWidth(containerWidth * 0.85); // 85% width to show peek of next card
    }
  }, []);

  return (
    <Box className={className} width="100%">
      <Box ref={containerRef} width="100%" overflow="hidden">
        <MotionGrid
          gridTemplateColumns={`repeat(${children.length}, 85%)`}
          gap={gap}
          drag="x"
          dragConstraints={{
            left: -(children.length - 1) * slideWidth,
            right: 0,
          }}
          onDragEnd={handleDragEnd}
          animate={{ x: -currentIndex * slideWidth }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}>
          {children.map((child, index) => (
            <GridItem key={index}>{child}</GridItem>
          ))}
        </MotionGrid>
      </Box>

      {showDots && children.length > 1 && (
        <HStack justify="flex-start" mt={4} spacing={1}>
          {children.map((_, index) => (
            <Box
              key={index}
              width={"6px"}
              height={"6px"}
              borderRadius="full"
              bg={index === currentIndex ? "primary.700" : "gray.300"}
              cursor="pointer"
              onClick={() => slideToIndex(index)}
              transition="background-color 0.2s"
            />
          ))}
        </HStack>
      )}
    </Box>
  );
};
