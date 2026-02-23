import { useEffect, useState } from 'react';

const AnimatedCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to true to prevent flash on mobile

  useEffect(() => {
    // Check if device is touch or mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over buttons, links, or specific clickable elements
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer');
        
      setIsHovering(!!isClickable);
    };

    if (!isMobile) {
      window.addEventListener('mousemove', updatePosition);
      window.addEventListener('mouseover', updateHoverState);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', updateHoverState);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-4 h-4 rounded-full bg-[var(--sp-accent)] pointer-events-none z-[9999] mix-blend-screen transition-transform duration-100 ease-out"
        style={{ 
          transform: `translate(${position.x - 8}px, ${position.y - 8}px) scale(${isHovering ? 0.5 : 1})`,
        }}
      />
      <div 
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-[var(--sp-accent)] pointer-events-none z-[9998] transition-all duration-300 ease-out"
        style={{ 
          transform: `translate(${position.x - 20}px, ${position.y - 20}px) scale(${isHovering ? 1.5 : 1})`,
          opacity: isHovering ? 0.5 : 0.8
        }}
      />
    </>
  );
};

export default AnimatedCursor;
