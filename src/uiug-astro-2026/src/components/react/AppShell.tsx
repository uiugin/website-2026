import React, { useEffect, useState, createContext, useContext } from 'react';
import type { PaletteId, PaletteColors } from '../../lib/palette';
import { PRESET_PALETTES } from '../../lib/palette';
import type { LayoutLink } from '../../types/layout';
import type { Speaker } from '../../data/speakers';
import type { FestivalBannerProps } from '../../lib/festival-mapper';
import Navbar from './Navbar';
import Loader from './Loader';
import FestivalBanner from './FestivalBanner';

interface AppShellContextType {
  onOpenFullSpeakerList: () => void;
}

const AppShellContext = createContext<AppShellContextType | undefined>(undefined);

export const useAppShell = () => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within AppShell');
  }
  return context;
};

interface AppShellProps {
  children?: React.ReactNode;
  logo?: string;
  navItems?: LayoutLink[];
  ctaItem?: LayoutLink | null;
  fullListSpeakers?: Speaker[];
  festival?: FestivalBannerProps | null;
}

const LOADER_DONE_KEY = 'uiug-loader-done';

const AppShell: React.FC<AppShellProps> = ({
  children,
  logo,
  navItems,
  ctaItem,
  fullListSpeakers: _fullListSpeakers,
  festival,
}) => {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem(LOADER_DONE_KEY) !== '1';
  });
  const [_showFullSpeakerList, setShowFullSpeakerList] = useState(false);

  // Initialize state from local storage or system preference
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [currentPaletteId, setCurrentPaletteId] = useState<PaletteId>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('paletteId') as PaletteId) || 'default';
    }
    return 'default';
  });

  const [customColors, setCustomColors] = useState<PaletteColors>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customColors');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return { primary: '#FF4500', accent: '#00FFFF' };
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    // Update the HTML element class immediately
    const root = window.document.documentElement;
    if (newIsDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const changePalette = (id: PaletteId) => {
    setCurrentPaletteId(id);
    localStorage.setItem('paletteId', id);
  };

  const updateCustomColors = (colors: PaletteColors) => {
    setCustomColors(colors);
    localStorage.setItem('customColors', JSON.stringify(colors));
    if (currentPaletteId !== 'custom') {
      changePalette('custom');
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const root = window.document.documentElement;
    let colors: PaletteColors;

    if (currentPaletteId === 'custom') {
      colors = customColors;
    } else {
      colors = PRESET_PALETTES[currentPaletteId as Exclude<PaletteId, 'custom'>].colors;
    }

    if (colors) {
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-accent', colors.accent);
      // Also update the accent-yellow CSS variable for Tailwind
      root.style.setProperty('--color-accent-yellow', colors.accent);
    }
  }, [currentPaletteId, customColors]);

  return (
    <AppShellContext.Provider value={{ onOpenFullSpeakerList: () => setShowFullSpeakerList(true) }}>
      {isLoading && (
      <Loader
        onComplete={() => {
          if (typeof window !== 'undefined') sessionStorage.setItem(LOADER_DONE_KEY, '1');
          setIsLoading(false);
        }}
      />
    )}

      <div className={`min-h-screen font-mono text-black dark:text-white selection:bg-accent-yellow selection:text-black overflow-x-hidden w-full transition-opacity duration-1000 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={isLoading ? { visibility: 'hidden' } : { visibility: 'visible' }}>
        <div className="fixed top-0 left-0 w-full z-50">
          <Navbar
            isDark={isDark}
            toggleTheme={toggleTheme}
            currentPaletteId={currentPaletteId}
            changePalette={changePalette}
            customColors={customColors}
            updateCustomColors={updateCustomColors}
            logo={logo}
            navItems={navItems}
            ctaItem={ctaItem}
          />
          {festival?.marqueeItems?.length ? <FestivalBanner festival={festival} /> : null}
        </div>
        <div
          className={
            festival?.marqueeItems?.length
              ? 'relative pt-[calc(5rem+var(--festival-banner-h))] md:pt-[calc(8rem+var(--festival-banner-h))]'
              : 'relative pt-20 md:pt-32'
          }
        >
          {children}
        </div>
      </div>
    </AppShellContext.Provider>
  );
};

export default AppShell;
