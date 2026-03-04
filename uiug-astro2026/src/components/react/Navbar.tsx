import React, { useState } from 'react';
import { Menu, X, Sun, Moon, Palette, Check } from 'lucide-react';
import type { PaletteId, PaletteColors } from '../../lib/palette';
import { PRESET_PALETTES } from '../../lib/palette';
import type { LayoutLink } from '../../types/layout';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  currentPaletteId: PaletteId;
  changePalette: (id: PaletteId) => void;
  customColors: PaletteColors;
  updateCustomColors: (colors: PaletteColors) => void;
  logo?: string;
  navItems?: LayoutLink[];
  ctaItem?: LayoutLink | null;
}

/** Format a link title to brutalist style: uppercase with underscores */
function brutalize(text: string): string {
  return text.toUpperCase().replace(/\s+/g, '_');
}

const Navbar: React.FC<NavbarProps> = ({
  isDark,
  toggleTheme,
  currentPaletteId,
  changePalette,
  customColors,
  updateCustomColors,
  logo = 'UIUG',
  navItems = [],
  ctaItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Fallback to hardcoded items if API provides nothing
  const displayNavItems = navItems.length > 0
    ? navItems
    : [
    ];

  const displayCta = ctaItem ?? { title: 'Join The Void', url: '#join', target: null };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-black border-b-4 border-black dark:border-white transition-colors duration-300">
      <div className="flex justify-between items-stretch h-16 md:h-auto">
        {/* Logo Section */}
        <div className="px-6 py-4 border-r-4 border-black dark:border-white flex items-center bg-primary text-black hover:bg-black hover:text-primary dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer">
          <span className="text-2xl md:text-3xl font-display leading-none tracking-tighter">{logo}</span>
        </div>

        {/* Desktop Links & Toggle */}
        <div className="hidden md:flex items-stretch text-sm font-bold tracking-tighter">
          {displayNavItems.map((item, i) => (
            <a
              key={`${item.url}-${i}`}
              href={item.url}
              target={item.target ?? undefined}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="px-6 lg:px-8 border-r-4 border-black dark:border-white flex items-center hover:bg-primary hover:text-black dark:text-white dark:hover:bg-primary dark:hover:text-black transition-none uppercase"
            >
              {brutalize(item.title)}
            </a>
          ))}

          {/* Palette Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className={`h-full px-6 border-r-4 border-black dark:border-white flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors ${currentPaletteId === 'custom' ? 'bg-primary text-black' : ''}`}
              aria-label="Change Color Palette"
            >
              <Palette className="w-6 h-6" />
            </button>

            {isPaletteOpen && (
              <div className="absolute top-full right-0 mt-4 border-4 border-black dark:border-white bg-white dark:bg-black shadow-brutal-black dark:shadow-brutal-white w-64 z-50 p-2">
                {/* Presets */}
                {(Object.entries(PRESET_PALETTES) as [string, typeof PRESET_PALETTES.default][]).map(([id, preset]) => (
                  <button
                    key={id}
                    onClick={() => {
                      changePalette(id as PaletteId);
                    }}
                    className={`w-full text-left p-3 mb-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900 border-2 border-transparent hover:border-black dark:hover:border-white ${currentPaletteId === id ? 'bg-gray-200 dark:bg-gray-800 border-black dark:border-white' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex border border-black dark:border-white">
                        <div className="w-4 h-4" style={{ backgroundColor: preset.colors.primary }}></div>
                        <div className="w-4 h-4" style={{ backgroundColor: preset.colors.accent }}></div>
                      </div>
                      <span className="font-bold uppercase text-black dark:text-white text-xs">{preset.name}</span>
                    </div>
                    {currentPaletteId === id && <Check size={16} className="text-black dark:text-white" />}
                  </button>
                ))}

                {/* Custom Option */}
                <div className={`p-3 border-2 ${currentPaletteId === 'custom' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' : 'border-transparent'}`}>
                  <button
                    onClick={() => changePalette('custom')}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <span className="font-bold uppercase text-black dark:text-white text-xs">CUSTOM_BUILD</span>
                    {currentPaletteId === 'custom' && <Check size={16} className="text-black dark:text-white" />}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-black dark:text-white">Primary</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColors.primary}
                          onChange={(e) => updateCustomColors({ ...customColors, primary: e.target.value })}
                          className="w-full h-8 border-2 border-black dark:border-white p-0 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-black dark:text-white">Accent</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColors.accent}
                          onChange={(e) => updateCustomColors({ ...customColors, accent: e.target.value })}
                          className="w-full h-8 border-2 border-black dark:border-white p-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="px-6 border-r-4 border-black dark:border-white flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>

          <a
            href={displayCta.url}
            target={displayCta.target ?? undefined}
            rel={displayCta.target === '_blank' ? 'noopener noreferrer' : undefined}
            className="bg-accent-yellow text-black px-8 lg:px-10 flex items-center hover:bg-black hover:text-accent-yellow transition-none border-l-0"
          >
            {brutalize(displayCta.title)}
          </a>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden">
          <button
            className={`px-5 border-l-4 border-black dark:border-white flex items-center justify-center hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors ${isPaletteOpen ? 'bg-black text-white dark:bg-white dark:text-black' : ''}`}
            onClick={() => {
              setIsPaletteOpen(!isPaletteOpen);
              setIsOpen(false);
            }}
          >
            <Palette size={24} />
          </button>

          <button
            className="px-5 border-l-4 border-black dark:border-white flex items-center justify-center hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          <button
            className="px-6 border-l-4 border-black dark:border-white flex items-center justify-center hover:bg-primary dark:text-white dark:hover:text-black"
            onClick={() => {
              setIsOpen(!isOpen);
              setIsPaletteOpen(false);
            }}
          >
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile Palette Drawer (displayed below navbar if open) */}
      {isPaletteOpen && (
        <div className="md:hidden border-t-4 border-black dark:border-white bg-white dark:bg-black absolute w-full left-0 top-full z-40 p-4 shadow-brutal-black dark:shadow-brutal-white">
          <h4 className="font-display text-lg mb-4 text-black dark:text-white">SELECT_THEME</h4>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(Object.entries(PRESET_PALETTES) as [string, typeof PRESET_PALETTES.default][]).map(([id, preset]) => (
              <button
                key={id}
                onClick={() => {
                  changePalette(id as PaletteId);
                  setIsPaletteOpen(false);
                }}
                className={`text-left p-3 border-4 border-black dark:border-white flex flex-col gap-2 ${currentPaletteId === id ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-gray-900 dark:text-white'}`}
              >
                <div className="flex border border-black dark:border-white w-fit">
                  <div className="w-4 h-4" style={{ backgroundColor: preset.colors.primary }}></div>
                  <div className="w-4 h-4" style={{ backgroundColor: preset.colors.accent }}></div>
                </div>
                <span className="font-bold uppercase text-xs">{preset.name}</span>
              </button>
            ))}
          </div>

          <h4 className="font-display text-lg mb-4 text-black dark:text-white">CUSTOM_OVERRIDE</h4>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 border-4 border-black dark:border-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-black dark:text-white">Primary</label>
                <input
                  type="color"
                  value={customColors.primary}
                  onChange={(e) => updateCustomColors({ ...customColors, primary: e.target.value })}
                  className="w-full h-10 border-4 border-black dark:border-white p-0 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-black dark:text-white">Accent</label>
                <input
                  type="color"
                  value={customColors.accent}
                  onChange={(e) => updateCustomColors({ ...customColors, accent: e.target.value })}
                  className="w-full h-10 border-4 border-black dark:border-white p-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isOpen && !isPaletteOpen && (
        <div className="md:hidden border-t-4 border-black dark:border-white bg-white dark:bg-black absolute w-full left-0 top-full">
          {displayNavItems.map((item, i) => (
            <a
              key={`mobile-${item.url}-${i}`}
              href={item.url}
              target={item.target ?? undefined}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="block p-6 border-b-4 border-black dark:border-white font-display text-xl uppercase text-black dark:text-white hover:bg-accent-yellow hover:text-black dark:hover:bg-accent-yellow dark:hover:text-black"
              onClick={() => setIsOpen(false)}
            >
              {brutalize(item.title)}
            </a>
          ))}
          <a
            href={displayCta.url}
            target={displayCta.target ?? undefined}
            rel={displayCta.target === '_blank' ? 'noopener noreferrer' : undefined}
            className="block p-6 border-b-4 border-black dark:border-white font-display text-xl uppercase bg-primary text-black"
            onClick={() => setIsOpen(false)}
          >
            {brutalize(displayCta.title)}
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
