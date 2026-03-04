import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  delay?: number;
  duration?: number;
}

// Vertical Reveal - Moves Up and Fades In
export const Reveal: React.FC<Props> = ({ 
  children, 
  width = "fit-content", 
  className = "",
  delay = 0.25,
  duration = 0.5
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} style={{ position: "relative", width }} className={className}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration, delay, ease: [0.25, 1, 0.5, 1] }} // Heavy mechanical ease
      >
        {children}
      </motion.div>
    </div>
  );
};

interface SlideProps extends Props {
    direction?: "left" | "right";
}

// Horizontal Reveal - Slides in from side
export const Slide: React.FC<SlideProps> = ({ 
    children, 
    width = "fit-content", 
    className = "",
    delay = 0.25,
    direction = "left"
  }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const mainControls = useAnimation();
  
    useEffect(() => {
      if (isInView) {
        mainControls.start("visible");
      }
    }, [isInView, mainControls]);
  
    return (
      <div ref={ref} style={{ position: "relative", width }} className={className}>
        <motion.div
          variants={{
            hidden: { opacity: 0, x: direction === 'left' ? -100 : 100 },
            visible: { opacity: 1, x: 0 },
          }}
          initial="hidden"
          animate={mainControls}
          transition={{ duration: 0.6, delay, type: "spring", stiffness: 50, damping: 15 }} // Industrial spring
        >
          {children}
        </motion.div>
      </div>
    );
  };

