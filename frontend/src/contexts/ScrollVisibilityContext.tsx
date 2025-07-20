import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface ScrollVisibilityContextType {
  isHeaderVisible: boolean;
  isMobile: boolean;
}

const ScrollVisibilityContext = createContext<ScrollVisibilityContextType | undefined>(undefined);

interface ScrollVisibilityProviderProps {
  children: ReactNode;
}

export function ScrollVisibilityProvider({ children }: ScrollVisibilityProviderProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const lastScrollY = useRef(0);
  const scrollThreshold = 10;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsHeaderVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return;
      }

      if (currentScrollY < 50) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  return (
    <ScrollVisibilityContext.Provider value={{ isHeaderVisible, isMobile }}>
      {children}
    </ScrollVisibilityContext.Provider>
  );
}

export function useScrollVisibility() {
  const context = useContext(ScrollVisibilityContext);
  if (context === undefined) {
    throw new Error('useScrollVisibility must be used within a ScrollVisibilityProvider');
  }
  return context;
}