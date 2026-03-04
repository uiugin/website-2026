export type PaletteId = 'default' | 'cyber' | 'ocean' | 'toxic' | 'custom';

export interface PaletteColors {
  primary: string;
  accent: string;
}

export const PRESET_PALETTES: Record<Exclude<PaletteId, 'custom'>, { name: string; colors: PaletteColors }> = {
  default: { name: 'UIUG', colors: { primary: '#FF0000', accent: '#FFFF00' } },
  cyber: { name: 'CYBER', colors: { primary: '#00FF41', accent: '#FF00FF' } },
  ocean: { name: 'OCEAN', colors: { primary: '#0044FF', accent: '#00FFFF' } },
  toxic: { name: 'TOXIC', colors: { primary: '#BD00FF', accent: '#CCFF00' } },
};

