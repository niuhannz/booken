'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import type { TrimSize, PaperStock, Unit } from '@/lib/bookmath';
import {
  TRIM_SIZES,
  PAPER_STOCKS,
  COVER_FONTS,
  calcCoverDimensions,
  formatDim,
  inToMm,
} from '@/lib/bookmath';
import { useStore, type CoverTextLayer } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Download,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Wand2,
  Upload,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface CoverCreatorState {
  selectedTrimSize: string | null;
  customTrimWidth: number;
  customTrimHeight: number;
  unit: Unit;
  pageCount: number;
  bleed: number;
  selectedPaperStock: string;
  apiKey: string;
  textPrompt: string;
  styleSelection: 'Photographic' | 'Illustration' | 'Abstract' | 'Typography';
  uploadedImage: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
  zoomLevel: number;
  showBleeds: boolean;
  showSafeZone: boolean;
  showLabels: boolean;
}

function generateId(): string {
  return `layer_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export default function CoverCreator() {
  const store = useStore();
  const activeProject = store.getActiveProject();

  const [state, setState] = useState<CoverCreatorState>({
    selectedTrimSize: '6" × 9"',
    customTrimWidth: 6,
    customTrimHeight: 9,
    unit: 'in',
    pageCount: 200,
    bleed: 0.125,
    selectedPaperStock: 'White Uncoated (60#)',
    apiKey: '',
    textPrompt: '',
    styleSelection: 'Photographic',
    uploadedImage: null,
    generatedImage: null,
    isGenerating: false,
    zoomLevel: 100,
    showBleeds: true,
    showSafeZone: true,
    showLabels: true,
  });

  const [textLayers, setTextLayers] = useState<CoverTextLayer[]>(
    activeProject?.coverTextLayers || []
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current trim size
  const getTrimSize = (): { width: number; height: number } => {
    if (state.selectedTrimSize === 'Custom') {
      return {
        width: state.customTrimWidth,
        height: state.customTrimHeight,
      };
    }
    const selected = TRIM_SIZES.find((t) => t.name === state.selectedTrimSize);
    return selected || { width: 6, height: 9 };
  };

  // Get current paper stock
  const getPaperStock = (): PaperStock => {
    return PAPER_STOCKS.find((p) => p.name === state.selectedPaperStock) || PAPER_STOCKS[1];
  };

  // Calculate dimensions
  const trimSize = getTrimSize();
  const paperStock = getPaperStock();
  const dimensions = calcCoverDimensions(
    trimSize.width,
    trimSize.height,
    state.pageCount,
    paperStock,
    state.bleed,
    0.125
  );

  // Convert dimensions based on unit
  const displayDim = (value: number) => formatDim(value, state.unit);

  // Add text layer
  const addTextLayer = useCallback((text: string = '', preset?: Partial<CoverTextLayer>) => {
    const newLayer: CoverTextLayer = {
      id: generateId(),
      text,
      fontFamily: COVER_FONTS[0].family,
      fontSize: 32,
      color: '#000000',
      x: 50,
      y: 50,
      bold: false,
      italic: false,
      align: 'center',
      ...preset,
    };
    setTextLayers((prev) => [...prev, newLayer]);
  }, []);

  // Update text layer
  const updateTextLayer = useCallback((id: string, patch: Partial<CoverTextLayer>) => {
    setTextLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer))
    );
  }, []);

  // Delete text layer
  const deleteTextLayer = useCallback((id: string) => {
    setTextLayers((prev) => prev.filter((layer) => layer.id !== id));
  }, []);

  // Save text layers to project
  const saveTextLayers = useCallback(() => {
    if (activeProject) {
      store.updateProject(activeProject.id, { coverTextLayers: textLayers });
    }
  }, [activeProject, textLayers, store]);

  // Auto-save text layers
  useEffect(() => {
    saveTextLayers();
  }, [textLayers, saveTextLayers]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpi = 72;
    const pxWidth = (dimensions.fullWidth * dpi * state.zoomLevel) / 100;
    const pxHeight = (dimensions.fullHeight * dpi * state.zoomLevel) / 100;

    canvas.width = pxWidth;
    canvas.height = pxHeight;

    const scale = (state.zoomLevel / 100) * dpi;
    const inToPx = (inches: number) => inches * scale;

    // Background
    ctx.fillStyle = '#1a1815';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate positions
    const bleedPx = inToPx(dimensions.bleed);
    const backStart = bleedPx;
    const spineStart = backStart + inToPx(dimensions.trimWidth);
    const frontStart = spineStart + inToPx(dimensions.spineWidth);
    const coverEnd = frontStart + inToPx(dimensions.trimWidth);
    const topBleed = bleedPx;
    const coverHeight = inToPx(dimensions.trimHeight);

    // Draw bleed areas
    if (state.showBleeds) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
      ctx.fillRect(0, 0, pxWidth, topBleed);
      ctx.fillRect(0, topBleed + coverHeight, pxWidth, topBleed);
      ctx.fillRect(0, 0, bleedPx, pxHeight);
      ctx.fillRect(coverEnd, 0, bleedPx, pxHeight);
    }

    // Draw white background for cover area
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(backStart, topBleed, inToPx(dimensions.fullWidth - dimensions.bleed * 2), coverHeight);

    // Draw uploaded/generated image on front cover
    const imageUrl = state.generatedImage || state.uploadedImage;
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const frontCoverX = frontStart;
        const frontCoverY = topBleed;
        const frontCoverWidth = inToPx(dimensions.trimWidth);
        const frontCoverHeight = coverHeight;
        ctx.drawImage(img, frontCoverX, frontCoverY, frontCoverWidth, frontCoverHeight);
      };
      img.src = imageUrl;
    }

    // Draw trim lines (red dashed)
    ctx.strokeStyle = '#ff0000';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.strokeRect(backStart, topBleed, inToPx(dimensions.trimWidth), coverHeight);
    ctx.strokeRect(frontStart, topBleed, inToPx(dimensions.trimWidth), coverHeight);

    // Draw spine fold lines
    ctx.strokeStyle = '#000000';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(spineStart, topBleed);
    ctx.lineTo(spineStart, topBleed + coverHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(frontStart, topBleed);
    ctx.lineTo(frontStart, topBleed + coverHeight);
    ctx.stroke();

    // Draw safe zone (blue dashed)
    if (state.showSafeZone) {
      ctx.strokeStyle = '#0066ff';
      ctx.setLineDash([2, 4]);
      const safeOffset = inToPx(0.125);
      ctx.strokeRect(
        backStart + safeOffset,
        topBleed + safeOffset,
        inToPx(dimensions.trimWidth) - safeOffset * 2,
        coverHeight - safeOffset * 2
      );
      ctx.strokeRect(
        frontStart + safeOffset,
        topBleed + safeOffset,
        inToPx(dimensions.trimWidth) - safeOffset * 2,
        coverHeight - safeOffset * 2
      );
    }

    // Reset line dash
    ctx.setLineDash([]);

    // Draw labels
    if (state.showLabels) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelY = topBleed + coverHeight / 2;
      ctx.fillText(
        'BACK',
        backStart + inToPx(dimensions.trimWidth) / 2,
        labelY
      );
      ctx.fillText(
        'SPINE',
        spineStart + inToPx(dimensions.spineWidth) / 2,
        labelY
      );
      ctx.fillText(
        'FRONT',
        frontStart + inToPx(dimensions.trimWidth) / 2,
        labelY
      );
    }

    // Draw text layers on front cover only
    textLayers.forEach((layer) => {
      if (!layer.text.trim()) return;

      const frontCoverX = frontStart;
      const frontCoverY = topBleed;
      const frontCoverWidth = inToPx(dimensions.trimWidth);
      const frontCoverHeight = coverHeight;

      // Convert x,y from 0-1 to absolute position within front cover
      const textX = frontCoverX + (layer.x / 100) * frontCoverWidth;
      const textY = frontCoverY + (layer.y / 100) * frontCoverHeight;

      ctx.fillStyle = layer.color;
      const fontWeight = layer.bold ? 'bold' : 'normal';
      const fontStyle = layer.italic ? 'italic' : 'normal';
      const fontSize = `${fontWeight} ${fontStyle} ${layer.fontSize}px ${layer.fontFamily}`.trim();
      ctx.font = fontSize;

      // Set text alignment
      if (layer.align === 'center') {
        ctx.textAlign = 'center';
      } else if (layer.align === 'right') {
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'left';
      }

      ctx.textBaseline = 'top';
      ctx.fillText(layer.text, textX, textY);
    });
  }, [dimensions, state.zoomLevel, state.showBleeds, state.showSafeZone, state.showLabels, state.uploadedImage, state.generatedImage, textLayers]);

  // Handle trim size change
  const handleTrimSizeChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      selectedTrimSize: value,
    }));
  };

  // Handle custom dimensions
  const handleCustomWidthChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setState((prev) => ({
      ...prev,
      customTrimWidth: num,
    }));
  };

  const handleCustomHeightChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setState((prev) => ({
      ...prev,
      customTrimHeight: num,
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setState((prev) => ({
          ...prev,
          uploadedImage: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock image generation
  const handleGenerateImage = useCallback(async () => {
    if (!state.textPrompt) {
      alert('Please enter a text prompt');
      return;
    }

    setState((prev) => ({
      ...prev,
      isGenerating: true,
    }));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 400, 600);
      gradient.addColorStop(0, '#8B7355');
      gradient.addColorStop(1, '#D4A574');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 600);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Georgia';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Generated Image', 200, 300);
      ctx.font = '14px Georgia';
      ctx.fillText(`Style: ${state.styleSelection}`, 200, 340);
      ctx.fillText(state.textPrompt.substring(0, 40) + '...', 200, 370);
    }

    const imageData = canvas.toDataURL('image/png');
    setState((prev) => ({
      ...prev,
      generatedImage: imageData,
      isGenerating: false,
    }));
  }, [state.textPrompt, state.styleSelection]);

  // Export to PDF
  const handleExportPDF = () => {
    const widthMm = inToMm(dimensions.fullWidth);
    const heightMm = inToMm(dimensions.fullHeight);

    const pdf = new jsPDF({
      orientation: widthMm > heightMm ? 'l' : 'p',
      unit: 'mm',
      format: [widthMm, heightMm],
    });

    const bleedMm = inToMm(dimensions.bleed);
    const trimWidthMm = inToMm(dimensions.trimWidth);
    const spineWidthMm = inToMm(dimensions.spineWidth);
    const trimHeightMm = inToMm(dimensions.trimHeight);

    const backStart = bleedMm;
    const spineStart = backStart + trimWidthMm;
    const frontStart = spineStart + spineWidthMm;

    // Draw bleed areas
    pdf.setDrawColor(255, 200, 200);
    pdf.setFillColor(255, 200, 200);
    pdf.rect(0, 0, bleedMm, heightMm, 'F');
    pdf.rect(widthMm - bleedMm, 0, bleedMm, heightMm, 'F');
    pdf.rect(0, 0, widthMm, bleedMm, 'F');
    pdf.rect(0, heightMm - bleedMm, widthMm, bleedMm, 'F');

    // Draw trim lines
    pdf.setDrawColor(255, 0, 0);
    (pdf as any).setLineDash([2, 1]);
    pdf.rect(backStart, bleedMm, trimWidthMm, trimHeightMm);
    pdf.rect(frontStart, bleedMm, trimWidthMm, trimHeightMm);

    // Draw spine fold lines
    pdf.setDrawColor(0, 0, 0);
    (pdf as any).setLineDash([1.5, 1.5]);
    pdf.line(spineStart, bleedMm, spineStart, bleedMm + trimHeightMm);
    pdf.line(frontStart, bleedMm, frontStart, bleedMm + trimHeightMm);

    // Draw safe zone lines
    pdf.setDrawColor(0, 102, 255);
    (pdf as any).setLineDash([1, 2]);
    const safeOffset = inToMm(0.125);
    pdf.rect(
      backStart + safeOffset,
      bleedMm + safeOffset,
      trimWidthMm - safeOffset * 2,
      trimHeightMm - safeOffset * 2
    );
    pdf.rect(
      frontStart + safeOffset,
      bleedMm + safeOffset,
      trimWidthMm - safeOffset * 2,
      trimHeightMm - safeOffset * 2
    );

    // Draw text layers on front cover in PDF
    (pdf as any).setLineDash([]);
    textLayers.forEach((layer) => {
      if (!layer.text.trim()) return;

      const frontCoverX = frontStart;
      const frontCoverY = bleedMm;
      const frontCoverWidth = trimWidthMm;
      const frontCoverHeight = trimHeightMm;

      // Convert x,y from 0-1 to absolute position
      const textX = frontCoverX + (layer.x / 100) * frontCoverWidth;
      const textY = frontCoverY + (layer.y / 100) * frontCoverHeight;

      // Set text properties
      const colorHex = layer.color.replace('#', '');
      const r = parseInt(colorHex.slice(0, 2), 16);
      const g = parseInt(colorHex.slice(2, 4), 16);
      const b = parseInt(colorHex.slice(4, 6), 16);
      pdf.setTextColor(r, g, b);

      const fontSize = layer.fontSize * (210 / 72); // Convert pt to mm (approx)
      pdf.setFontSize(fontSize);

      // Use a standard font, fallback from the family name
      const fontName = layer.fontFamily.includes('Playfair') ? 'Playfair Display' :
                       layer.fontFamily.includes('Garamond') ? 'EB Garamond' :
                       'helvetica';
      const fontStyle = (layer.bold ? 'b' : '') + (layer.italic ? 'i' : '');
      try {
        pdf.setFont(fontName, fontStyle as any);
      } catch {
        pdf.setFont('helvetica', fontStyle as any);
      }

      // Alignment
      if (layer.align === 'center') {
        pdf.text(layer.text, textX, textY, { align: 'center' });
      } else if (layer.align === 'right') {
        pdf.text(layer.text, textX, textY, { align: 'right' });
      } else {
        pdf.text(layer.text, textX, textY, { align: 'left' });
      }
    });

    pdf.save('book-cover-template.pdf');
  };

  // Group trim sizes by category
  const groupedTrimSizes = TRIM_SIZES.reduce(
    (acc, size) => {
      if (!acc[size.category]) {
        acc[size.category] = [];
      }
      acc[size.category].push(size);
      return acc;
    },
    {} as Record<string, TrimSize[]>
  );

  return (
    <div className="flex h-screen flex-col bg-[#08080d]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Left Panel - Settings */}
        <div className="w-80 overflow-y-auto rounded-xl bk-glass-strong p-6">
          <h1 className="mb-6 text-2xl font-bold text-[#e8e4df] bk-display" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Cover Creator
          </h1>

          <Tabs defaultValue="dimensions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="generate">Image</TabsTrigger>
            </TabsList>

            {/* Dimensions Tab */}
            <TabsContent value="dimensions" className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="trim-size" className="text-sm font-semibold text-[#8a8490]">
                  Trim Size
                </Label>
                <Select value={state.selectedTrimSize || ''} onValueChange={handleTrimSizeChange}>
                  <SelectTrigger id="trim-size">
                    <SelectValue placeholder="Select trim size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Custom">Custom</SelectItem>
                    {Object.entries(groupedTrimSizes).map(([category, sizes]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-[#5a5560]">
                          {category}
                        </div>
                        {sizes.map((size) => (
                          <SelectItem key={size.name} value={size.name}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {state.selectedTrimSize === 'Custom' && (
                <div className="space-y-3 rounded-lg bk-glass p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="custom-width" className="text-xs text-[#8a8490]">
                        Width
                      </Label>
                      <Input
                        id="custom-width"
                        type="number"
                        step="0.1"
                        value={state.customTrimWidth}
                        onChange={(e) => handleCustomWidthChange(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-height" className="text-xs text-[#8a8490]">
                        Height
                      </Label>
                      <Input
                        id="custom-height"
                        type="number"
                        step="0.1"
                        value={state.customTrimHeight}
                        onChange={(e) => handleCustomHeightChange(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#8a8490]">Unit</Label>
                <div className="flex gap-2">
                  <Button
                    variant={state.unit === 'in' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setState((prev) => ({ ...prev, unit: 'in' }))}
                    className="flex-1"
                  >
                    Inches
                  </Button>
                  <Button
                    variant={state.unit === 'mm' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setState((prev) => ({ ...prev, unit: 'mm' }))}
                    className="flex-1"
                  >
                    Millimeters
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-count" className="text-sm font-semibold text-[#8a8490]">
                  Page Count
                </Label>
                <Input
                  id="page-count"
                  type="number"
                  min="1"
                  value={state.pageCount}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      pageCount: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paper-stock" className="text-sm font-semibold text-[#8a8490]">
                  Paper Stock
                </Label>
                <Select value={state.selectedPaperStock} onValueChange={(value) =>
                  setState((prev) => ({ ...prev, selectedPaperStock: value }))
                }>
                  <SelectTrigger id="paper-stock">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_STOCKS.map((stock) => (
                      <SelectItem key={stock.name} value={stock.name}>
                        <div>
                          <div className="font-medium">{stock.name}</div>
                          <div className="text-xs text-[#5a5560]">{stock.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bleed" className="text-sm font-semibold text-[#8a8490]">
                  Bleed Amount ({state.unit === 'in' ? '"' : 'mm'})
                </Label>
                <Input
                  id="bleed"
                  type="number"
                  step="0.01"
                  min="0"
                  value={state.bleed}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      bleed: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <Card className="bk-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Calculated Dimensions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8a8490]">Spine Width:</span>
                    <span className="font-semibold text-[#e8e4df]">{displayDim(dimensions.spineWidth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a8490]">Full Cover Width:</span>
                    <span className="font-semibold text-[#e8e4df]">{displayDim(dimensions.fullWidth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a8490]">Full Cover Height:</span>
                    <span className="font-semibold text-[#e8e4df]">{displayDim(dimensions.fullHeight)}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Text Layers Tab */}
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[#8a8490]">Preset Layers</Label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      addTextLayer('Book Title', {
                        fontSize: 64,
                        fontFamily: COVER_FONTS.find((f) => f.name === 'Playfair Display')?.family || COVER_FONTS[0].family,
                        bold: true,
                        y: 40,
                      })
                    }
                  >
                    <Type className="mr-2 h-4 w-4" />
                    Add Title
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      addTextLayer('Author Name', {
                        fontSize: 28,
                        fontFamily: COVER_FONTS[0].family,
                        y: 70,
                      })
                    }
                  >
                    <Type className="mr-2 h-4 w-4" />
                    Add Author
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      addTextLayer('Subtitle', {
                        fontSize: 18,
                        fontFamily: COVER_FONTS[0].family,
                        italic: true,
                        y: 55,
                      })
                    }
                  >
                    <Type className="mr-2 h-4 w-4" />
                    Add Subtitle
                  </Button>
                </div>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm font-semibold text-[#8a8490]">Text Layers</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addTextLayer('New text')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {textLayers.length === 0 ? (
                    <p className="text-xs text-[#5a5560] italic">No text layers. Click the + button to add one.</p>
                  ) : (
                    textLayers.map((layer) => (
                      <Card key={layer.id} className="bk-glass">
                        <CardContent className="pt-4 space-y-3">
                          {/* Text input */}
                          <div>
                            <Label className="text-xs text-[#8a8490]">Text</Label>
                            <Input
                              type="text"
                              value={layer.text}
                              onChange={(e) => updateTextLayer(layer.id, { text: e.target.value })}
                              placeholder="Enter text"
                              className="h-8 text-xs"
                            />
                          </div>

                          {/* Font family */}
                          <div>
                            <Label className="text-xs text-[#8a8490]">Font</Label>
                            <Select
                              value={layer.fontFamily}
                              onValueChange={(value) => updateTextLayer(layer.id, { fontFamily: value })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COVER_FONTS.map((font) => (
                                  <SelectItem key={font.family} value={font.family}>
                                    <div className="text-xs">{font.name}</div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Font size */}
                          <div>
                            <Label className="text-xs text-[#8a8490]">
                              Size: {layer.fontSize}pt
                            </Label>
                            <Slider
                              value={[layer.fontSize]}
                              onValueChange={(v) => updateTextLayer(layer.id, { fontSize: v[0] })}
                              min={12}
                              max={120}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Color picker */}
                          <div>
                            <Label className="text-xs text-[#8a8490]">Color</Label>
                            <input
                              type="color"
                              value={layer.color}
                              onChange={(e) => updateTextLayer(layer.id, { color: e.target.value })}
                              className="h-8 w-full rounded-lg bk-glass-input"
                            />
                          </div>

                          {/* Bold and Italic toggles */}
                          <div className="flex gap-2">
                            <label className="flex items-center gap-2 text-xs text-[#e8e4df]">
                              <Checkbox
                                checked={layer.bold}
                                onCheckedChange={(checked) =>
                                  updateTextLayer(layer.id, { bold: checked as boolean })
                                }
                              />
                              Bold
                            </label>
                            <label className="flex items-center gap-2 text-xs text-[#e8e4df]">
                              <Checkbox
                                checked={layer.italic}
                                onCheckedChange={(checked) =>
                                  updateTextLayer(layer.id, { italic: checked as boolean })
                                }
                              />
                              Italic
                            </label>
                          </div>

                          {/* Alignment */}
                          <div>
                            <Label className="text-xs text-[#8a8490]">Alignment</Label>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={layer.align === 'left' ? 'default' : 'outline'}
                                onClick={() => updateTextLayer(layer.id, { align: 'left' })}
                                className="flex-1 h-8"
                              >
                                <AlignLeft className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={layer.align === 'center' ? 'default' : 'outline'}
                                onClick={() => updateTextLayer(layer.id, { align: 'center' })}
                                className="flex-1 h-8"
                              >
                                <AlignCenter className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant={layer.align === 'right' ? 'default' : 'outline'}
                                onClick={() => updateTextLayer(layer.id, { align: 'right' })}
                                className="flex-1 h-8"
                              >
                                <AlignRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* X position */}
                          <div>
                            <Label className="text-xs text-[#8a8490]">
                              Horizontal: {Math.round(layer.x)}%
                            </Label>
                            <Slider
                              value={[layer.x]}
                              onValueChange={(v) => updateTextLayer(layer.id, { x: v[0] })}
                              min={0}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Y position */}
                          <div>
                            <Label className="text-xs text-[#8a8490]">
                              Vertical: {Math.round(layer.y)}%
                            </Label>
                            <Slider
                              value={[layer.y]}
                              onValueChange={(v) => updateTextLayer(layer.id, { y: v[0] })}
                              min={0}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Delete button */}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full h-8"
                            onClick={() => deleteTextLayer(layer.id)}
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Image Tab */}
            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-sm font-semibold text-[#8a8490]">
                  API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter API key"
                  value={state.apiKey}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      apiKey: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-semibold text-[#8a8490]">
                  Text Prompt
                </Label>
                <textarea
                  id="prompt"
                  placeholder="Describe the cover design..."
                  value={state.textPrompt}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      textPrompt: e.target.value,
                    }))
                  }
                  className="min-h-24 w-full rounded-lg bk-glass-input p-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style" className="text-sm font-semibold text-[#8a8490]">
                  Style
                </Label>
                <Select
                  value={state.styleSelection}
                  onValueChange={(value: any) =>
                    setState((prev) => ({
                      ...prev,
                      styleSelection: value,
                    }))
                  }
                >
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Photographic">Photographic</SelectItem>
                    <SelectItem value="Illustration">Illustration</SelectItem>
                    <SelectItem value="Abstract">Abstract</SelectItem>
                    <SelectItem value="Typography">Typography</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateImage}
                disabled={state.isGenerating || !state.textPrompt}
                className="w-full bk-btn-accent"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {state.isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>

              <div className="text-xs text-[#5a5560]">
                Note: Image generation is a placeholder. Actual API integration can be added later.
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#8a8490]">Or Upload Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  className="w-full bk-btn-ghost"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Canvas Preview */}
        <div className="flex flex-1 flex-col rounded-xl bk-glass p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#e8e4df] bk-display" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Preview
            </h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    zoomLevel: 100,
                  }))
                }
              >
                Fit
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    zoomLevel: Math.max(50, prev.zoomLevel - 25),
                  }))
                }
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-sm text-[#e8e4df]">{state.zoomLevel}%</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    zoomLevel: Math.min(200, prev.zoomLevel + 25),
                  }))
                }
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-lg p-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <canvas
              ref={canvasRef}
              className="mx-auto"
              style={{
                imageRendering: 'pixelated',
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-[#e8e4df]">
              <Checkbox
                checked={state.showBleeds}
                onCheckedChange={(checked) =>
                  setState((prev) => ({
                    ...prev,
                    showBleeds: checked as boolean,
                  }))
                }
              />
              Show Bleeds
            </label>
            <label className="flex items-center gap-2 text-sm text-[#e8e4df]">
              <Checkbox
                checked={state.showSafeZone}
                onCheckedChange={(checked) =>
                  setState((prev) => ({
                    ...prev,
                    showSafeZone: checked as boolean,
                  }))
                }
              />
              Show Safe Zone
            </label>
            <label className="flex items-center gap-2 text-sm text-[#e8e4df]">
              <Checkbox
                checked={state.showLabels}
                onCheckedChange={(checked) =>
                  setState((prev) => ({
                    ...prev,
                    showLabels: checked as boolean,
                  }))
                }
              />
              Show Labels
            </label>
          </div>
        </div>
      </div>

      {/* Bottom - Export Section */}
      <div className="border-t border-[rgba(255,255,255,0.06)] bk-glass px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#8a8490] bk-ui" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            <span className="font-semibold">Full Dimensions: </span>
            {displayDim(dimensions.fullWidth)} × {displayDim(dimensions.fullHeight)}
          </div>
          <Button
            onClick={handleExportPDF}
            className="bk-btn-accent"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF Template
          </Button>
        </div>
      </div>
    </div>
  );
}