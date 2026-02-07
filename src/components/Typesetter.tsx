import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import {
  TRIM_SIZES,
  BOOK_FONTS,
  TYPESET_PRESETS,
  type Unit,
  formatDim,
  inToMm,
  PAPER_STOCKS,
  calcSpineWidth,
} from '@/lib/bookmath';
import { useStore } from '@/lib/store';
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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  BookOpen,
  FileText,
  Columns2,
  Save,
} from 'lucide-react';

const SAMPLE_TEXT = `# Chapter One

The morning light crept through the curtains, casting long shadows across the worn wooden floor. Eleanor stood at the window, watching the last stars fade into the pale blue canvas of dawn. The village below was stirring — a baker's chimney sent its first plume of smoke into the cool air, and somewhere a rooster declared the day begun.

She had not slept well. The letter lay on her desk where she had left it, its cream-colored envelope bearing the seal of the Alderman's office. Three months she had waited for a response, and now that it had arrived, she found herself unable to read past the first line.

"Dear Miss Ashworth," it began, and already she could sense the careful, diplomatic language that would follow — the kind of language used to soften a blow.

The floorboards creaked behind her. "You're up early," said Thomas, leaning against the doorframe. His shirt was untucked, his dark hair still tousled from sleep. He held two cups of tea, offering one to her with the steady hand of someone who had learned not to ask too many questions before breakfast.

"I couldn't sleep," she said, accepting the cup. The warmth of it grounded her. "The letter came."

Thomas glanced at the desk. "And?"

"I haven't finished reading it."

He nodded slowly, sipping his tea. "Then there's still hope in Schrödinger's envelope," he said, the corner of his mouth twitching upward.

Eleanor almost smiled. Almost. Instead she turned back to the window and watched the village come alive, one chimney at a time. There would be time enough for letters and their consequences. For now, the morning was still hers.

# Chapter Two

The road to Blackmere wound through dense woodland, the kind of forest that swallowed sound and light in equal measure. Eleanor walked it alone, her boots crunching on the gravel path that had been laid down — according to local legend — by monks fleeing the dissolution of the monasteries.

Whether that was true or merely a pleasant fiction, the path served its purpose. It connected the village of Ashford to the neighboring town of Blackmere, a journey of roughly four miles that could be completed in an hour of brisk walking or two hours of contemplation.

Eleanor chose contemplation.

The letter, which she had finally read in its entirety over a second cup of tea, contained both less and more than she had feared. The Alderman's office acknowledged her petition. They did not dismiss it outright, which was more than most had predicted. But they required documentation — birth records, property deeds, letters of character — that would take weeks to assemble.

She carried with her a list of what was needed, written in her careful hand on the back of the envelope itself. Practical. Resourceful. These were words people used to describe Eleanor Ashworth, and she wore them like armor.

The woodland gave way to open fields, and the first rooftops of Blackmere appeared above the hedgerows. It was a larger town than Ashford — it had a proper high street, a market square, and even a small lending library housed in what had once been a chapel. It was to the library that Eleanor was headed.

Mrs. Holloway, the librarian, was one of the few people in the county who might know where to find the older parish records. She was also, as it happened, one of the few people Eleanor trusted without reservation.

The bell above the door chimed softly as Eleanor entered. The library smelled of dust and binding glue and something faintly floral — lavender, perhaps, tucked between the shelves. Mrs. Holloway looked up from behind the circulation desk, her reading glasses perched on the end of her nose.

"Eleanor Ashworth," she said, as though naming a visitor was a form of greeting. "I was wondering when you'd come."`;

interface PageObj {
  lines: string[];
  pageNumber: number;
  isRecto: boolean;
  chapterTitle: string;
  isChapterStart: boolean;
}

interface Settings {
  trimSizeName: string;
  customWidth: number;
  customHeight: number;
  unit: Unit;
  marginTop: number;
  marginBottom: number;
  marginInner: number;
  marginOuter: number;
  mirrorMargins: boolean;
  fontIdx: number;
  fontSize: number;
  lineHeight: number;
  firstLineIndent: number;
  paragraphSpacing: number;
  chapterStartRecto: boolean;
  dropCaps: boolean;
  dropCapLines: number;
  chapterFontSize: number;
  showRunningHeader: boolean;
  bookTitle: string;
  showPageNumbers: boolean;
  pageNumberPosition: string;
  startPageNumber: number;
  paperStockIdx: number;
}

const DEFAULTS: Settings = {
  trimSizeName: '5.5" × 8.5"',
  customWidth: 5.5,
  customHeight: 8.5,
  unit: 'in',
  marginTop: 0.875,
  marginBottom: 0.75,
  marginInner: 0.875,
  marginOuter: 0.625,
  mirrorMargins: true,
  fontIdx: 0,
  fontSize: 11,
  lineHeight: 1.45,
  firstLineIndent: 0.25,
  paragraphSpacing: 4,
  chapterStartRecto: true,
  dropCaps: true,
  dropCapLines: 3,
  chapterFontSize: 24,
  showRunningHeader: true,
  bookTitle: 'Untitled Book',
  showPageNumbers: true,
  pageNumberPosition: 'bottom-center',
  startPageNumber: 1,
  paperStockIdx: 0,
};

// ────────────────────────────────────────────
// Pagination engine using DOM measurement
// ────────────────────────────────────────────
function paginateText(
  text: string,
  settings: Settings,
  trimW: number,
  trimH: number,
): PageObj[] {
  // Parse chapters
  const rawLines = text.split('\n');
  const chapters: { title: string; paragraphs: string[][] }[] = [];
  let cur: { title: string; paragraphs: string[][] } | null = null;
  let pBuf: string[] = [];

  const flushPara = () => {
    if (pBuf.length > 0 && cur) {
      cur.paragraphs.push([...pBuf]);
      pBuf = [];
    }
  };

  for (const line of rawLines) {
    if (line.startsWith('# ')) {
      flushPara();
      if (cur) chapters.push(cur);
      cur = { title: line.slice(2).trim(), paragraphs: [] };
      pBuf = [];
    } else if (line.trim() === '') {
      flushPara();
    } else {
      pBuf.push(line);
    }
  }
  flushPara();
  if (cur) chapters.push(cur);

  // Calculate available text area height in points (for estimation)
  const headerSpace = settings.showRunningHeader ? 18 : 0;
  const footerSpace = settings.showPageNumbers ? 16 : 0;
  const textAreaH =
    (trimH - settings.marginTop - settings.marginBottom) * 72 - headerSpace - footerSpace;
  const lineH = settings.fontSize * settings.lineHeight;

  // Estimate lines per page
  const linesPerPage = Math.floor(textAreaH / lineH);

  // Estimate characters per line
  const textAreaW = (trimW - settings.marginInner - settings.marginOuter) * 72;
  const avgCharWidth = settings.fontSize * 0.5; // rough approximation
  const charsPerLine = Math.floor(textAreaW / avgCharWidth);

  const pages: PageObj[] = [];
  let pageNum = settings.startPageNumber;
  let currentLines: string[] = [];
  let currentLineCount = 0;
  let currentChapterTitle = '';

  const pushPage = (isChapterStart: boolean) => {
    if (currentLines.length === 0) return;
    pages.push({
      lines: [...currentLines],
      pageNumber: pageNum,
      isRecto: pageNum % 2 === 1,
      chapterTitle: currentChapterTitle,
      isChapterStart,
    });
    pageNum++;
    currentLines = [];
    currentLineCount = 0;
  };

  const addLine = (line: string, heightInLines: number) => {
    if (currentLineCount + heightInLines > linesPerPage && currentLines.length > 0) {
      pushPage(false);
    }
    currentLines.push(line);
    currentLineCount += heightInLines;
  };

  // Word-wrap a paragraph into lines
  const wrapParagraph = (text: string, indent: boolean): string[] => {
    const words = text.split(/\s+/);
    const result: string[] = [];
    let line = indent ? '    ' : ''; // visual indent
    const effectiveChars = indent ? charsPerLine - 4 : charsPerLine;

    for (const word of words) {
      if (line.length + word.length + 1 > (result.length === 0 ? effectiveChars + 4 : charsPerLine)) {
        if (line.trim()) result.push(line);
        line = word;
      } else {
        line = line ? line + ' ' + word : word;
      }
    }
    if (line.trim()) result.push(line);
    return result;
  };

  for (let ci = 0; ci < chapters.length; ci++) {
    const ch = chapters[ci];
    currentChapterTitle = ch.title;

    // Start chapter on recto if needed
    if (settings.chapterStartRecto && currentLines.length > 0) {
      pushPage(false);
      // If we're now on a verso page, insert blank page
      if (pageNum % 2 === 0) {
        pages.push({
          lines: [],
          pageNumber: pageNum,
          isRecto: false,
          chapterTitle: currentChapterTitle,
          isChapterStart: false,
        });
        pageNum++;
      }
    } else if (currentLines.length > 0) {
      pushPage(false);
    }

    // Chapter heading takes ~3 lines worth of space
    const chapterHeadingLines = Math.ceil(
      (settings.chapterFontSize / settings.fontSize) * 2 + 2,
    );
    currentLines.push(`# ${ch.title}`);
    currentLineCount += chapterHeadingLines;

    // Process paragraphs
    for (let pi = 0; pi < ch.paragraphs.length; pi++) {
      const para = ch.paragraphs[pi];
      const paraText = para.join(' ');
      const isFirstPara = pi === 0;
      const wrappedLines = wrapParagraph(paraText, !isFirstPara && settings.firstLineIndent > 0);

      // Add paragraph spacing
      if (pi > 0 && settings.paragraphSpacing > 0) {
        addLine('', settings.paragraphSpacing / lineH);
      }

      // Mark first paragraph for drop cap rendering
      if (isFirstPara && settings.dropCaps && wrappedLines.length > 0) {
        wrappedLines[0] = '@@DROPCAP@@' + wrappedLines[0];
      }

      for (const wl of wrappedLines) {
        addLine(wl, 1);
      }
    }
  }

  // Flush remaining
  if (currentLines.length > 0) {
    pushPage(false);
  }

  // Mark chapter start pages
  for (const page of pages) {
    if (page.lines.length > 0 && page.lines[0].startsWith('# ')) {
      page.isChapterStart = true;
    }
  }

  return pages;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────
export default function Typesetter() {
  const [manuscript, setManuscript] = useState(SAMPLE_TEXT);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [pages, setPages] = useState<PageObj[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [twoPageView, setTwoPageView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const store = useStore();

  // Load manuscript on mount if there's an active project
  useEffect(() => {
    if (store.activeProjectId) {
      const project = store.getActiveProject?.();
      if (project?.manuscript) {
        setManuscript(project.manuscript);
      }
    }
  }, [store.activeProjectId, store]);

  // Resolve trim dimensions
  const trimSize = TRIM_SIZES.find((t) => t.name === settings.trimSizeName);
  const trimW = trimSize ? trimSize.width : settings.customWidth;
  const trimH = trimSize ? trimSize.height : settings.customHeight;
  const font = BOOK_FONTS[settings.fontIdx] || BOOK_FONTS[0];

  // Repaginate on changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const p = paginateText(manuscript, settings, trimW, trimH);
      setPages(p);
      setCurrentPageIndex(0);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [manuscript, settings, trimW, trimH]);

  const set = useCallback(
    <K extends keyof Settings>(key: K, val: Settings[K]) => {
      setSettings((s) => ({ ...s, [key]: val }));
    },
    [],
  );

  const applyPreset = (presetIdx: number) => {
    const preset = TYPESET_PRESETS[presetIdx];
    if (!preset) return;
    setSettings((s) => ({
      ...s,
      fontIdx: preset.fontIdx,
      fontSize: preset.fontSize,
      lineHeight: preset.lineHeight,
      firstLineIndent: preset.firstLineIndent,
      paragraphSpacing: preset.paragraphSpacing,
      chapterFontSize: preset.chapterFontSize,
      dropCaps: preset.dropCaps,
      dropCapLines: preset.dropCapLines,
    }));
  };

  const wordCount = useMemo(
    () => manuscript.split(/\s+/).filter((w) => w.length > 0).length,
    [manuscript],
  );
  const charCount = manuscript.length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setManuscript(ev.target?.result as string);
    reader.readAsText(file);
  };

  const saveToProject = () => {
    if (store.activeProjectId && store.updateProject) {
      store.updateProject(store.activeProjectId, { manuscript });
    }
  };

  const saveVersionHandler = () => {
    if (store.activeProjectId && store.saveVersion) {
      const label = `v${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
      store.saveVersion(store.activeProjectId, label);
    }
  };

  // Spine calculation
  const stock = PAPER_STOCKS[settings.paperStockIdx] || PAPER_STOCKS[0];
  const estimatedPageCount = pages.length * 2; // leaves ≈ pages in book
  const spine = calcSpineWidth(estimatedPageCount, stock);

  // PDF export
  const exportPDF = () => {
    const wMm = inToMm(trimW);
    const hMm = inToMm(trimH);
    const doc = new jsPDF({ unit: 'mm', format: [wMm, hMm] });

    const mTop = inToMm(settings.marginTop);
    const mBot = inToMm(settings.marginBottom);
    const mIn = inToMm(settings.marginInner);
    const mOut = inToMm(settings.marginOuter);

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) doc.addPage([wMm, hMm]);
      const page = pages[i];
      const isRecto = page.isRecto;
      const ml = settings.mirrorMargins ? (isRecto ? mIn : mOut) : mIn;
      const mr = settings.mirrorMargins ? (isRecto ? mOut : mIn) : mOut;
      const textW = wMm - ml - mr;
      let y = mTop + 4;

      // Running header
      if (settings.showRunningHeader && !page.isChapterStart) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120, 120, 120);
        const hdr = isRecto ? (page.chapterTitle || settings.bookTitle) : settings.bookTitle;
        doc.text(hdr, ml + textW / 2, mTop, { align: 'center' });
        y = mTop + 5;
      }

      doc.setFontSize(settings.fontSize);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const lineHMm = (settings.fontSize * settings.lineHeight) / 2.835; // pt → mm

      for (const line of page.lines) {
        if (y > hMm - mBot - 5) break;

        if (line.startsWith('# ')) {
          // Chapter heading
          const title = line.slice(2).trim();
          y += lineHMm * 3; // extra space above
          doc.setFontSize(settings.chapterFontSize);
          doc.setFont('helvetica', 'bold');
          const wrapped = doc.splitTextToSize(title, textW);
          for (const wl of wrapped) {
            doc.text(wl, ml + textW / 2, y, { align: 'center' });
            y += (settings.chapterFontSize * 1.3) / 2.835;
          }
          y += lineHMm * 1.5;
          doc.setFontSize(settings.fontSize);
          doc.setFont('helvetica', 'normal');
        } else if (line.trim() === '') {
          y += settings.paragraphSpacing / 2.835;
        } else {
          let textLine = line.replace('@@DROPCAP@@', '');

          // Drop cap
          if (line.startsWith('@@DROPCAP@@') && settings.dropCaps && textLine.length > 0) {
            const dc = textLine.charAt(0);
            textLine = textLine.substring(1);
            doc.setFontSize(settings.fontSize * 2.5);
            doc.setFont('helvetica', 'bold');
            doc.text(dc, ml, y + 1);
            const dcW = doc.getTextWidth(dc) + 1;
            doc.setFontSize(settings.fontSize);
            doc.setFont('helvetica', 'normal');
            const wrapped = doc.splitTextToSize(textLine, textW - dcW);
            for (let li = 0; li < wrapped.length; li++) {
              const xOff = li < settings.dropCapLines ? ml + dcW : ml;
              const w = li < settings.dropCapLines ? textW - dcW : textW;
              doc.text(wrapped[li], xOff, y, { maxWidth: w });
              y += lineHMm;
            }
          } else {
            const wrapped = doc.splitTextToSize(textLine, textW);
            for (const wl of wrapped) {
              doc.text(wl, ml, y, { maxWidth: textW });
              y += lineHMm;
            }
          }
        }
      }

      // Page number
      if (settings.showPageNumbers) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const numStr = String(page.pageNumber);
        const pos = settings.pageNumberPosition;
        if (pos === 'bottom-center') {
          doc.text(numStr, wMm / 2, hMm - mBot + 5, { align: 'center' });
        } else if (pos === 'bottom-outside') {
          doc.text(numStr, isRecto ? wMm - mr : ml, hMm - mBot + 5, {
            align: isRecto ? 'right' : 'left',
          });
        } else {
          doc.text(numStr, isRecto ? wMm - mr : ml, mTop - 2, {
            align: isRecto ? 'right' : 'left',
          });
        }
      }
    }

    doc.save(`${settings.bookTitle.replace(/\s+/g, '_')}.pdf`);
  };

  // ── Render helpers ──
  const PAGE_SCALE = 0.65;
  const pageWPx = trimW * 96 * PAGE_SCALE;
  const pageHPx = trimH * 96 * PAGE_SCALE;

  const renderPage = (page: PageObj | undefined, idx: number) => {
    if (!page) return null;
    const isRecto = page.isRecto;
    const ml = settings.mirrorMargins
      ? isRecto ? settings.marginInner : settings.marginOuter
      : settings.marginInner;
    const mr = settings.mirrorMargins
      ? isRecto ? settings.marginOuter : settings.marginInner
      : settings.marginOuter;

    return (
      <div
        key={idx}
        className="relative flex-shrink-0"
        style={{
          width: pageWPx,
          height: pageHPx,
          background: '#e8e4de',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 60px rgba(196,149,106,0.03)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            paddingTop: settings.marginTop * 96 * PAGE_SCALE,
            paddingBottom: settings.marginBottom * 96 * PAGE_SCALE,
            paddingLeft: ml * 96 * PAGE_SCALE,
            paddingRight: mr * 96 * PAGE_SCALE,
            fontFamily: font.family,
            fontSize: settings.fontSize * PAGE_SCALE,
            lineHeight: settings.lineHeight,
            color: '#1a1a1a',
          }}
        >
          {/* Running header */}
          {settings.showRunningHeader && !page.isChapterStart && (
            <div
              className="absolute left-0 right-0 text-center"
              style={{
                top: (settings.marginTop * 96 * PAGE_SCALE) / 2 - 4,
                fontSize: 8 * PAGE_SCALE,
                color: '#888',
                fontStyle: 'italic',
                letterSpacing: '0.05em',
                paddingLeft: ml * 96 * PAGE_SCALE,
                paddingRight: mr * 96 * PAGE_SCALE,
              }}
            >
              {isRecto ? page.chapterTitle || settings.bookTitle : settings.bookTitle}
            </div>
          )}

          {/* Page content */}
          <div className="h-full overflow-hidden">
            {page.lines.map((line, li) => {
              if (line.startsWith('# ')) {
                return (
                  <div
                    key={li}
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: settings.chapterFontSize * PAGE_SCALE,
                      fontWeight: 700,
                      textAlign: 'center',
                      marginTop: settings.fontSize * PAGE_SCALE * 3,
                      marginBottom: settings.fontSize * PAGE_SCALE * 2,
                      letterSpacing: '0.04em',
                      lineHeight: 1.2,
                    }}
                  >
                    {line.slice(2)}
                  </div>
                );
              }
              if (line.trim() === '') {
                return <div key={li} style={{ height: settings.paragraphSpacing * PAGE_SCALE }} />;
              }

              const hasDropCap = line.startsWith('@@DROPCAP@@');
              const text = line.replace('@@DROPCAP@@', '');

              if (hasDropCap && settings.dropCaps && text.length > 0) {
                const firstChar = text.charAt(0);
                const rest = text.substring(1);
                return (
                  <p key={li} style={{ textAlign: 'justify', margin: 0, textIndent: 0 }}>
                    <span
                      style={{
                        float: 'left',
                        fontSize: settings.fontSize * PAGE_SCALE * settings.dropCapLines,
                        lineHeight: 0.8,
                        fontWeight: 700,
                        marginRight: 3 * PAGE_SCALE,
                        marginTop: 2 * PAGE_SCALE,
                        color: '#333',
                      }}
                    >
                      {firstChar}
                    </span>
                    {rest}
                  </p>
                );
              }

              return (
                <p
                  key={li}
                  style={{
                    margin: 0,
                    textAlign: 'justify',
                    textIndent:
                      line.startsWith('    ') ? settings.firstLineIndent * 96 * PAGE_SCALE : 0,
                  }}
                >
                  {text}
                </p>
              );
            })}
          </div>

          {/* Page number */}
          {settings.showPageNumbers && (
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                bottom: (settings.marginBottom * 96 * PAGE_SCALE) / 2 - 4,
                fontSize: 9 * PAGE_SCALE,
                color: '#888',
                textAlign:
                  settings.pageNumberPosition === 'bottom-center'
                    ? 'center'
                    : isRecto
                      ? 'right'
                      : 'left',
                paddingLeft: ml * 96 * PAGE_SCALE,
                paddingRight: mr * 96 * PAGE_SCALE,
              }}
            >
              {page.pageNumber}
            </div>
          )}
        </div>
      </div>
    );
  };

  const currentPage = pages[currentPageIndex];
  const activeProject = store.activeProjectId ? store.getActiveProject?.() : null;

  return (
    <div className="flex h-full" style={{ background: '#08080d' }}>
      {/* ── Left Settings Panel ── */}
      <div
        className="w-[280px] flex-shrink-0 overflow-y-auto border-r bk-glass-strong"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="space-y-5 p-4">
          <h2
            className="text-lg font-bold bk-display"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#e8e4df' }}
          >
            Typesetter
          </h2>

          {/* Active Project Info */}
          {activeProject && (
            <div className="rounded p-3" style={{ background: 'rgba(196,149,106,0.08)', borderLeft: '3px solid #c4956a' }}>
              <p className="text-xs font-semibold" style={{ color: '#c4956a', marginBottom: '0.25rem' }}>
                ACTIVE PROJECT
              </p>
              <p className="text-xs" style={{ color: '#e8e4df', fontFamily: '"EB Garamond", serif' }}>
                {activeProject.title}
              </p>
            </div>
          )}

          {/* Presets Dropdown */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5560' }}>
              Typography Presets
            </h3>
            <Select onValueChange={(v) => applyPreset(parseInt(v))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select a preset..." />
              </SelectTrigger>
              <SelectContent>
                {TYPESET_PRESETS.map((preset, idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    <div>
                      <span className="font-medium">{preset.name}</span>
                      <span className="ml-2 text-[#5a5560] text-xs">— {preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {/* Page Setup */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5560' }}>
              Page Setup
            </h3>
            <div>
              <Label className="mb-1 text-xs" style={{ color: '#8a8490' }}>Trim Size</Label>
              <Select
                value={settings.trimSizeName}
                onValueChange={(v) => set('trimSizeName', v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIM_SIZES.map((t) => (
                    <SelectItem key={t.name} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {settings.trimSizeName === 'Custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs" style={{ color: '#8a8490' }}>W</Label>
                  <Input
                    type="number"
                    step={0.1}
                    className="h-7 text-xs"
                    value={settings.customWidth}
                    onChange={(e) => set('customWidth', parseFloat(e.target.value) || 5)}
                  />
                </div>
                <div>
                  <Label className="text-xs" style={{ color: '#8a8490' }}>H</Label>
                  <Input
                    type="number"
                    step={0.1}
                    className="h-7 text-xs"
                    value={settings.customHeight}
                    onChange={(e) => set('customHeight', parseFloat(e.target.value) || 8)}
                  />
                </div>
              </div>
            )}
          </section>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {/* Margins */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5560' }}>
              Margins
            </h3>
            {(['marginTop', 'marginBottom', 'marginInner', 'marginOuter'] as const).map((k) => {
              const label =
                k === 'marginTop'
                  ? 'Top'
                  : k === 'marginBottom'
                    ? 'Bottom'
                    : k === 'marginInner'
                      ? 'Inner / Gutter'
                      : 'Outer';
              return (
                <div key={k}>
                  <Label className="mb-1 flex justify-between text-xs" style={{ color: '#8a8490' }}>
                    <span>{label}</span>
                    <span className="font-mono">{settings[k].toFixed(2)}"</span>
                  </Label>
                  <Slider
                    min={0.25}
                    max={1.5}
                    step={0.025}
                    value={[settings[k]]}
                    onValueChange={([v]) => set(k, v)}
                  />
                </div>
              );
            })}
            <div className="flex items-center justify-between">
              <Label className="text-xs" style={{ color: '#8a8490' }}>Mirror Margins</Label>
              <Switch
                checked={settings.mirrorMargins}
                onCheckedChange={(v) => set('mirrorMargins', v)}
              />
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {/* Typography */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5560' }}>
              Typography
            </h3>
            <div>
              <Label className="mb-1 text-xs" style={{ color: '#8a8490' }}>Font Family</Label>
              <Select
                value={String(settings.fontIdx)}
                onValueChange={(v) => set('fontIdx', parseInt(v))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_FONTS.map((f, i) => (
                    <SelectItem key={f.name} value={String(i)}>
                      <span style={{ fontFamily: f.family }}>{f.name}</span>
                      <span className="ml-2 text-[#5a5560]">— {f.style}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 flex justify-between text-xs" style={{ color: '#8a8490' }}>
                <span>Size</span>
                <span className="font-mono">{settings.fontSize}pt</span>
              </Label>
              <Slider
                min={8}
                max={16}
                step={0.5}
                value={[settings.fontSize]}
                onValueChange={([v]) => set('fontSize', v)}
              />
            </div>
            <div>
              <Label className="mb-1 flex justify-between text-xs" style={{ color: '#8a8490' }}>
                <span>Leading</span>
                <span className="font-mono">{settings.lineHeight.toFixed(2)}×</span>
              </Label>
              <Slider
                min={1.0}
                max={2.0}
                step={0.05}
                value={[settings.lineHeight]}
                onValueChange={([v]) => set('lineHeight', v)}
              />
            </div>
            <div>
              <Label className="mb-1 flex justify-between text-xs" style={{ color: '#8a8490' }}>
                <span>First-line Indent</span>
                <span className="font-mono">{settings.firstLineIndent.toFixed(2)}"</span>
              </Label>
              <Slider
                min={0}
                max={0.5}
                step={0.025}
                value={[settings.firstLineIndent]}
                onValueChange={([v]) => set('firstLineIndent', v)}
              />
            </div>
            <div>
              <Label className="mb-1 flex justify-between text-xs" style={{ color: '#8a8490' }}>
                <span>¶ Spacing</span>
                <span className="font-mono">{settings.paragraphSpacing}pt</span>
              </Label>
              <Slider
                min={0}
                max={12}
                step={1}
                value={[settings.paragraphSpacing]}
                onValueChange={([v]) => set('paragraphSpacing', v)}
              />
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {/* Chapters */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5560' }}>
              Chapter Settings
            </h3>
            <div className="flex items-center justify-between">
              <Label className="text-xs" style={{ color: '#8a8490' }}>Start on Recto</Label>
              <Switch
                checked={settings.chapterStartRecto}
                onCheckedChange={(v) => set('chapterStartRecto', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs" style={{ color: '#8a8490' }}>Drop Caps</Label>
              <Switch
                checked={settings.dropCaps}
                onCheckedChange={(v) => set('dropCaps', v)}
              />
            </div>
            {settings.dropCaps && (
              <div>
                <Label className="mb-1 flex justify-between text-xs" style={{ color: '#8a8490' }}>
                  <span>Drop Cap Lines</span>
                  <span className="font-mono">{settings.dropCapLines}</span>
                </Label>
                <Slider
                  min={2}
                  max={5}
                  step={1}
                  value={[settings.dropCapLines]}
                  onValueChange={([v]) => set('dropCapLines', v)}
                />
              </div>
            )}
            <div>
              <Label className="mb-1 flex justify-between text-xs" style={{ color: '#8a8490' }}>
                <span>Heading Size</span>
                <span className="font-mono">{settings.chapterFontSize}pt</span>
              </Label>
              <Slider
                min={18}
                max={36}
                step={1}
                value={[settings.chapterFontSize]}
                onValueChange={([v]) => set('chapterFontSize', v)}
              />
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {/* Headers & Footers */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5560' }}>
              Headers & Footers
            </h3>
            <div className="flex items-center justify-between">
              <Label className="text-xs" style={{ color: '#8a8490' }}>Running Header</Label>
              <Switch
                checked={settings.showRunningHeader}
                onCheckedChange={(v) => set('showRunningHeader', v)}
              />
            </div>
            <div>
              <Label className="mb-1 text-xs" style={{ color: '#8a8490' }}>Book Title</Label>
              <Input
                className="h-7 text-xs"
                value={settings.bookTitle}
                onChange={(e) => set('bookTitle', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs" style={{ color: '#8a8490' }}>Page Numbers</Label>
              <Switch
                checked={settings.showPageNumbers}
                onCheckedChange={(v) => set('showPageNumbers', v)}
              />
            </div>
            {settings.showPageNumbers && (
              <>
                <div>
                  <Label className="mb-1 text-xs" style={{ color: '#8a8490' }}>Position</Label>
                  <Select
                    value={settings.pageNumberPosition}
                    onValueChange={(v) => set('pageNumberPosition', v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                      <SelectItem value="bottom-outside">Bottom Outside</SelectItem>
                      <SelectItem value="top-outside">Top Outside</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 text-xs" style={{ color: '#8a8490' }}>Start From</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs"
                    min={1}
                    value={settings.startPageNumber}
                    onChange={(e) => set('startPageNumber', parseInt(e.target.value) || 1)}
                  />
                </div>
              </>
            )}
          </section>

          {/* Store Integration Buttons */}
          {activeProject && (
            <>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
              <div className="space-y-2">
                <Button
                  size="sm"
                  className="bk-btn-accent w-full text-xs"
                  style={{ width: '100%', fontSize: '12px' }}
                  onClick={saveToProject}
                >
                  <Save className="mr-1 h-3 w-3" />
                  Save to Project
                </Button>
                <Button
                  size="sm"
                  className="bk-btn-ghost w-full text-xs"
                  style={{ width: '100%', fontSize: '12px' }}
                  onClick={saveVersionHandler}
                >
                  <Save className="mr-1 h-3 w-3" />
                  Save Version
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Center: Manuscript Editor ── */}
      <div className="flex flex-1 flex-col border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-center justify-between border-b px-4 py-2"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}
        >
          <span className="text-sm font-semibold" style={{ color: '#e8e4df', fontFamily: '"Cormorant Garamond", serif' }}>
            <FileText className="mr-1.5 inline-block h-4 w-4" />
            Manuscript
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setManuscript(SAMPLE_TEXT)}
            >
              <BookOpen className="mr-1 h-3 w-3" />
              Load Sample
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              Upload .txt
            </Button>
          </div>
        </div>
        <textarea
          className="flex-1 resize-none border-none p-4 font-mono text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.02)', color: '#e8e4df', lineHeight: 1.7 }}
          value={manuscript}
          onChange={(e) => setManuscript(e.target.value)}
          placeholder="Paste your manuscript here. Use # Chapter Title to mark chapters."
          spellCheck={false}
        />
        <div
          className="flex items-center justify-between border-t px-4 py-1.5 text-xs"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: '#5a5560' }}
        >
          <span>
            {wordCount.toLocaleString()} words · {charCount.toLocaleString()} characters
          </span>
          <span>Use <code className="rounded px-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
            # Title
          </code> for chapters</span>
        </div>
      </div>

      {/* ── Right: Page Preview ── */}
      <div className="flex w-[420px] flex-shrink-0 flex-col" style={{ background: '#0c0c12' }}>
        {/* Preview toolbar */}
        <div
          className="flex items-center justify-between border-b px-3 py-2"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}
        >
          <span className="text-sm font-semibold" style={{ color: '#e8e4df', fontFamily: '"Cormorant Garamond", serif' }}>
            Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded p-1"
              style={{ background: !twoPageView ? 'rgba(196,149,106,0.15)' : 'transparent' }}
              onClick={() => setTwoPageView(false)}
              title="Single page"
            >
              <FileText className="h-4 w-4" style={{ color: '#8a8490' }} />
            </button>
            <button
              className="rounded p-1"
              style={{ background: twoPageView ? 'rgba(196,149,106,0.15)' : 'transparent' }}
              onClick={() => setTwoPageView(true)}
              title="Two-page spread"
            >
              <Columns2 className="h-4 w-4" style={{ color: '#8a8490' }} />
            </button>
          </div>
        </div>

        {/* Pages */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-4" style={{ background: '#0c0c12' }}>
          {pages.length === 0 ? (
            <p className="text-sm" style={{ color: '#5a5560' }}>Enter text to see preview</p>
          ) : twoPageView ? (
            <div className="flex gap-2">
              {renderPage(
                currentPageIndex > 0 ? pages[currentPageIndex] : undefined,
                currentPageIndex,
              )}
              {renderPage(
                pages[currentPageIndex + (currentPage?.isRecto ? 0 : 1)],
                currentPageIndex + 1,
              )}
            </div>
          ) : (
            renderPage(currentPage, currentPageIndex)
          )}
        </div>

        {/* Page navigation */}
        <div
          className="flex items-center justify-center gap-4 border-t px-3 py-2"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}
        >
          <Button
            size="sm"
            variant="ghost"
            disabled={currentPageIndex === 0}
            onClick={() => setCurrentPageIndex((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs" style={{ color: '#5a5560' }}>
            Page {currentPageIndex + 1} of {pages.length}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={currentPageIndex >= pages.length - 1}
            onClick={() => setCurrentPageIndex((i) => Math.min(pages.length - 1, i + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Export footer */}
        <div
          className="space-y-2 border-t px-4 py-3"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="flex justify-between text-xs" style={{ color: '#5a5560' }}>
            <span>{pages.length} pages · est. spine {formatDim(spine, settings.unit)}</span>
            <span>
              {formatDim(trimW, settings.unit)} × {formatDim(trimH, settings.unit)}
            </span>
          </div>
          <div className="flex gap-2">
            <Select
              value={String(settings.paperStockIdx)}
              onValueChange={(v) => set('paperStockIdx', parseInt(v))}
            >
              <SelectTrigger className="h-8 flex-1 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_STOCKS.map((s, i) => (
                  <SelectItem key={s.name} value={String(i)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="bk-btn-accent text-xs"
              onClick={exportPDF}
            >
              <Download className="mr-1 h-3 w-3" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
