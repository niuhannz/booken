// Book dimension calculations for cover creation and typesetting

export type Unit = 'in' | 'mm';

export interface TrimSize {
  name: string;
  width: number; // inches
  height: number; // inches
  category: string;
}

export const TRIM_SIZES: TrimSize[] = [
  // US Trade
  { name: '5" × 8"', width: 5, height: 8, category: 'US Trade' },
  { name: '5.25" × 8"', width: 5.25, height: 8, category: 'US Trade' },
  { name: '5.5" × 8.5"', width: 5.5, height: 8.5, category: 'US Trade' },
  { name: '6" × 9"', width: 6, height: 9, category: 'US Trade' },
  { name: '7" × 10"', width: 7, height: 10, category: 'US Trade' },
  { name: '8" × 10"', width: 8, height: 10, category: 'US Trade' },
  { name: '8.5" × 11"', width: 8.5, height: 11, category: 'US Trade' },
  // A-Series (ISO)
  { name: 'A4 (210 × 297 mm)', width: 8.268, height: 11.693, category: 'ISO A-Series' },
  { name: 'A5 (148 × 210 mm)', width: 5.827, height: 8.268, category: 'ISO A-Series' },
  { name: 'A6 (105 × 148 mm)', width: 4.134, height: 5.827, category: 'ISO A-Series' },
  // B-Series (ISO)
  { name: 'B5 (176 × 250 mm)', width: 6.929, height: 9.843, category: 'ISO B-Series' },
  { name: 'B6 (125 × 176 mm)', width: 4.921, height: 6.929, category: 'ISO B-Series' },
  // UK / Commonwealth
  { name: 'Royal (6.14" × 9.21")', width: 6.14, height: 9.21, category: 'UK' },
  { name: 'Crown Quarto (7.44" × 9.69")', width: 7.44, height: 9.69, category: 'UK' },
  { name: 'Demy (5.43" × 8.5")', width: 5.43, height: 8.5, category: 'UK' },
];

export interface PaperStock {
  name: string;
  description: string;
  ppi: number; // pages per inch
}

export const PAPER_STOCKS: PaperStock[] = [
  { name: 'White Uncoated (50#)', description: 'Standard white, lightweight', ppi: 526 },
  { name: 'White Uncoated (60#)', description: 'Standard white, medium', ppi: 456 },
  { name: 'Cream/Natural (50#)', description: 'Cream offset, lightweight', ppi: 444 },
  { name: 'Cream/Natural (60#)', description: 'Cream offset, medium', ppi: 382 },
  { name: 'White Coated (70#)', description: 'Glossy/matte coated', ppi: 388 },
  { name: 'White Coated (80#)', description: 'Heavy coated, color books', ppi: 334 },
  { name: 'Groundwood (55#)', description: 'Newsprint-like, mass market', ppi: 480 },
];

// KDP-compatible calculation factors (inches per page)
export const KDP_FACTORS = {
  blackWhiteWhite: 0.002252,
  blackWhiteCream: 0.002347,
  colorInterior: 0.002347,
};

export function inToMm(inches: number): number {
  return inches * 25.4;
}

export function mmToIn(mm: number): number {
  return mm / 25.4;
}

export function formatDim(value: number, unit: Unit, decimals = 3): string {
  if (unit === 'mm') {
    return `${inToMm(value).toFixed(decimals === 3 ? 1 : decimals)} mm`;
  }
  return `${value.toFixed(decimals)}"`;
}

export function calcSpineWidth(pageCount: number, stock: PaperStock): number {
  // spine = pageCount / PPI
  return pageCount / stock.ppi;
}

export interface CoverDimensions {
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  bleed: number;
  // Computed
  fullWidth: number; // back + spine + front + bleeds
  fullHeight: number; // trim + bleeds
  safeZone: number; // how far content should be from trim edges
  wrapWidth: number; // total printable area width
  wrapHeight: number; // total printable area height
}

export function calcCoverDimensions(
  trimWidth: number,
  trimHeight: number,
  pageCount: number,
  stock: PaperStock,
  bleed: number = 0.125,
  safeZone: number = 0.125,
): CoverDimensions {
  const spineWidth = calcSpineWidth(pageCount, stock);
  const fullWidth = bleed + trimWidth + spineWidth + trimWidth + bleed;
  const fullHeight = bleed + trimHeight + bleed;

  return {
    trimWidth,
    trimHeight,
    spineWidth,
    bleed,
    fullWidth,
    fullHeight,
    safeZone,
    wrapWidth: fullWidth,
    wrapHeight: fullHeight,
  };
}

// Typesetting constants
export interface PageLayout {
  trimWidth: number; // inches
  trimHeight: number;
  marginTop: number;
  marginBottom: number;
  marginInner: number; // gutter
  marginOuter: number;
  fontSize: number; // pt
  lineHeight: number; // multiplier
  fontFamily: string;
}

export const DEFAULT_LAYOUT: PageLayout = {
  trimWidth: 5.5,
  trimHeight: 8.5,
  marginTop: 0.875,
  marginBottom: 0.75,
  marginInner: 0.875,
  marginOuter: 0.625,
  fontSize: 11,
  lineHeight: 1.45,
  fontFamily: 'Georgia, serif',
};

export const BOOK_FONTS = [
  // Classic / highly established
  { name: 'EB Garamond', family: '"EB Garamond", Garamond, serif', style: 'Classic book face · 1530s' },
  { name: 'Libre Baskerville', family: '"Libre Baskerville", Baskerville, serif', style: 'Transitional · 1757' },
  { name: 'Crimson Text', family: '"Crimson Text", serif', style: 'Old-style book serif' },
  { name: 'Lora', family: 'Lora, serif', style: 'Contemporary calligraphic' },
  { name: 'Source Serif 4', family: '"Source Serif 4", "Source Serif Pro", serif', style: 'Adobe open-source serif' },
  { name: 'Merriweather', family: 'Merriweather, serif', style: 'Screen-optimized serif' },
  { name: 'Spectral', family: 'Spectral, serif', style: 'Production-quality serif' },
  { name: 'Cormorant Garamond', family: '"Cormorant Garamond", Garamond, serif', style: 'Display Garamond · elegant' },
  { name: 'Vollkorn', family: 'Vollkorn, serif', style: 'Bread-and-butter book font' },
  { name: 'Bitter', family: 'Bitter, serif', style: 'Slab serif for reading' },
  { name: 'Playfair Display', family: '"Playfair Display", serif', style: 'High-contrast display · titles' },
  { name: 'DM Serif Display', family: '"DM Serif Display", serif', style: 'Modern display serif · titles' },
  // System fallbacks
  { name: 'Georgia', family: 'Georgia, serif', style: 'System · traditional' },
  { name: 'Palatino', family: '"Palatino Linotype", Palatino, serif', style: 'System · elegant' },
  { name: 'Times New Roman', family: '"Times New Roman", Times, serif', style: 'System · standard' },
];

// Cover fonts (broader selection including display faces)
export const COVER_FONTS = [
  ...BOOK_FONTS,
];

// Typesetting presets
export interface TypesetPreset {
  name: string;
  description: string;
  fontIdx: number; // index into BOOK_FONTS
  fontSize: number;
  lineHeight: number;
  firstLineIndent: number;
  paragraphSpacing: number;
  chapterFontSize: number;
  dropCaps: boolean;
  dropCapLines: number;
}

export const TYPESET_PRESETS: TypesetPreset[] = [
  {
    name: 'Classic Novel',
    description: 'Garamond · 11pt · Traditional indented paragraphs with drop caps',
    fontIdx: 0, fontSize: 11, lineHeight: 1.45, firstLineIndent: 0.25,
    paragraphSpacing: 0, chapterFontSize: 22, dropCaps: true, dropCapLines: 3,
  },
  {
    name: 'Modern Fiction',
    description: 'Lora · 11.5pt · Clean contemporary look',
    fontIdx: 3, fontSize: 11.5, lineHeight: 1.5, firstLineIndent: 0.2,
    paragraphSpacing: 2, chapterFontSize: 26, dropCaps: false, dropCapLines: 3,
  },
  {
    name: 'Literary Press',
    description: 'Spectral · 10.5pt · Tight elegant setting',
    fontIdx: 6, fontSize: 10.5, lineHeight: 1.42, firstLineIndent: 0.3,
    paragraphSpacing: 0, chapterFontSize: 20, dropCaps: true, dropCapLines: 2,
  },
  {
    name: 'Poetry Collection',
    description: 'Cormorant Garamond · 12pt · Generous leading for verse',
    fontIdx: 7, fontSize: 12, lineHeight: 1.8, firstLineIndent: 0,
    paragraphSpacing: 8, chapterFontSize: 18, dropCaps: false, dropCapLines: 3,
  },
  {
    name: 'Academic / Nonfiction',
    description: 'Source Serif · 11pt · Clear reading for dense text',
    fontIdx: 4, fontSize: 11, lineHeight: 1.5, firstLineIndent: 0.25,
    paragraphSpacing: 4, chapterFontSize: 24, dropCaps: false, dropCapLines: 3,
  },
  {
    name: 'Children\'s Chapter Book',
    description: 'Merriweather · 13pt · Large, friendly setting',
    fontIdx: 5, fontSize: 13, lineHeight: 1.6, firstLineIndent: 0.2,
    paragraphSpacing: 6, chapterFontSize: 28, dropCaps: true, dropCapLines: 2,
  },
];

// Calculate text area dimensions
export function getTextArea(layout: PageLayout) {
  const width = layout.trimWidth - layout.marginInner - layout.marginOuter;
  const height = layout.trimHeight - layout.marginTop - layout.marginBottom;
  return { width, height };
}
