import jsPDF from 'jspdf'
import { REPORT } from '../data/reportContent'

// ── Page geometry ──────────────────────────────────────────
const LEFT   = 38.1  // 1.5 inch — binding margin
const RIGHT  = 25.4  // 1 inch
const TOP    = 25.4  // 1 inch
const BOT    = 25.4  // 1 inch
const PAGE_W = 210
const PAGE_H = 297
const USABLE_W = PAGE_W - LEFT - RIGHT
const FONT = 'times'

// Word-form chapter numbers
const CH_WORDS: Record<string, string> = {
  '1':'ONE','2':'TWO','3':'THREE','4':'FOUR','5':'FIVE',
  '6':'SIX','7':'SEVEN','8':'EIGHT','9':'NINE','10':'TEN',
}

const ROMAN = ['','i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii']

// ── TOC entry collected during generation ──────────────────
interface TocEntry { label: string; page: number; level: number }

// ── Footer helpers ─────────────────────────────────────────
function writeFrontFooter(doc: jsPDF, romanIdx: number) {
  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(ROMAN[romanIdx] ?? String(romanIdx), PAGE_W / 2, PAGE_H - 12, { align: 'center' })
  doc.setTextColor(0, 0, 0)
}

function writeBodyFooter(doc: jsPDF, pageNum: number) {
  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(String(pageNum), PAGE_W / 2, PAGE_H - 12, { align: 'center' })
  doc.setTextColor(0, 0, 0)
}

// ── Text helpers ───────────────────────────────────────────
function addBody(
  doc: jsPDF,
  text: string,
  y: { v: number },
  page: { n: number },
  arabic: { n: number },
  fontSize = 12,
  bold = false,
  italic = false,
  align: 'left' | 'center' | 'justify' = 'left',
): void {
  doc.setFont(FONT, bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal')
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(text, USABLE_W)
  const lineH = fontSize * 0.5 * 2.0 // double spacing

  for (const line of lines) {
    if (y.v + lineH > PAGE_H - BOT - 16) {
      writeBodyFooter(doc, arabic.n)
      doc.addPage()
      page.n++
      arabic.n++
      y.v = TOP + 15
    }
    const x = align === 'center' ? PAGE_W / 2 : LEFT
    doc.text(line, x, y.v, { align: align === 'justify' ? 'left' : align })
    y.v += lineH
  }
  y.v += lineH * 0.35 // paragraph gap
}

function addFrontBody(
  doc: jsPDF,
  text: string,
  y: { v: number },
  page: { n: number },
  romanIdx: { n: number },
  fontSize = 12,
  bold = false,
  italic = false,
): void {
  doc.setFont(FONT, bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal')
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(text, USABLE_W)
  const lineH = fontSize * 0.5 * 2.0

  for (const line of lines) {
    if (y.v + lineH > PAGE_H - BOT - 16) {
      writeFrontFooter(doc, romanIdx.n)
      doc.addPage()
      page.n++
      romanIdx.n++
      y.v = TOP + 15
    }
    doc.text(line, LEFT, y.v)
    y.v += lineH
  }
  y.v += lineH * 0.35
}

function addChapterHeading(
  doc: jsPDF,
  chNum: string,
  title: string,
  y: { v: number },
  page: { n: number },
  arabic: { n: number },
  toc: TocEntry[],
): void {
  // Always start chapter on new page
  writeBodyFooter(doc, arabic.n)
  doc.addPage()
  page.n++
  arabic.n++
  y.v = TOP + 20

  toc.push({ label: `CHAPTER ${CH_WORDS[chNum] || chNum}: ${title.toUpperCase()}`, page: arabic.n, level: 0 })

  doc.setFont(FONT, 'bold')
  doc.setFontSize(14)
  doc.text(`CHAPTER ${CH_WORDS[chNum] || chNum}`, PAGE_W / 2, y.v, { align: 'center' })
  y.v += 10
  doc.text(title.toUpperCase(), PAGE_W / 2, y.v, { align: 'center' })
  y.v += 18
}

function addSectionHeading(
  doc: jsPDF,
  text: string,
  y: { v: number },
  page: { n: number },
  arabic: { n: number },
  toc: TocEntry[],
): void {
  const lineH = 12 * 0.5 * 2.0
  if (y.v + 28 > PAGE_H - BOT - 16) {
    writeBodyFooter(doc, arabic.n)
    doc.addPage()
    page.n++
    arabic.n++
    y.v = TOP + 15
  }
  toc.push({ label: text, page: arabic.n, level: 1 })
  y.v += 6
  doc.setFont(FONT, 'bold')
  doc.setFontSize(12)
  doc.text(text, LEFT, y.v)
  y.v += lineH
}

// ── Draw Table of Contents onto a specific page ────────────
function drawToc(doc: jsPDF, tocPage: number, toc: TocEntry[]) {
  doc.setPage(tocPage)
  let y = TOP + 15

  doc.setFont(FONT, 'bold')
  doc.setFontSize(14)
  doc.text('TABLE OF CONTENTS', PAGE_W / 2, y, { align: 'center' })
  y += 16

  // front matter entries (fixed)
  const frontEntries = [
    { label: 'Declaration', page: 'i' },
    { label: 'Certification', page: 'ii' },
    { label: 'Dedication', page: 'iii' },
    { label: 'Abstract', page: 'iv' },
    { label: 'Acknowledgements', page: 'v' },
    { label: 'Table of Contents', page: 'vi' },
  ]
  doc.setFont(FONT, 'normal')
  doc.setFontSize(11)
  for (const e of frontEntries) {
    const dots = buildDots(doc, e.label, String(e.page), USABLE_W)
    doc.text(dots, LEFT, y)
    y += 9
  }
  y += 4

  // chapter + section entries
  for (const e of toc) {
    if (y + 8 > PAGE_H - BOT - 16) {
      y = TOP + 15
      doc.addPage() // extra TOC page if needed
    }
    const isChapter = e.level === 0
    const indent = isChapter ? 0 : 10
    if (isChapter) {
      doc.setFont(FONT, 'bold')
      y += 2
    } else {
      doc.setFont(FONT, 'normal')
    }
    doc.setFontSize(11)
    const dots = buildDots(doc, e.label, String(e.page), USABLE_W - indent)
    doc.text(dots, LEFT + indent, y)
    y += isChapter ? 10 : 8
  }

  // References & Appendices
  const lastBodyPage = toc[toc.length - 1]?.page ?? 1
  const extra = [
    { label: 'References', page: lastBodyPage + 1 },
    { label: 'Appendix A: Database Schema', page: lastBodyPage + 2 },
    { label: 'Appendix B: Edge Function Excerpts', page: lastBodyPage + 3 },
    { label: 'Appendix C: System Screenshots', page: lastBodyPage + 4 },
    { label: 'Appendix D: User Testing Questionnaire', page: lastBodyPage + 5 },
  ]
  y += 4
  doc.setFont(FONT, 'bold')
  for (const e of extra) {
    if (y + 8 > PAGE_H - BOT - 16) break
    const dots = buildDots(doc, e.label, String(e.page), USABLE_W)
    doc.text(dots, LEFT, y)
    y += 10
  }
}

function buildDots(doc: jsPDF, label: string, pageStr: string, maxW: number): string {
  const pageW = doc.getTextWidth(pageStr)
  const labelW = doc.getTextWidth(label)
  const dotChar = '.'
  const dotW = doc.getTextWidth(dotChar)
  const available = maxW - labelW - pageW - 4
  const dotCount = Math.max(3, Math.floor(available / dotW))
  return label + ' ' + dotChar.repeat(dotCount) + ' ' + pageStr
}

// ── Main export ────────────────────────────────────────────
export async function downloadPdf() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const y = { v: TOP }
  const physPage = { n: 1 }      // physical page index
  const romanIdx = { n: 1 }      // displayed Roman numeral for front matter
  const arabic = { n: 1 }        // displayed Arabic numeral for chapters
  const toc: TocEntry[] = []

  // ── Try loading school logo ──
  let logoDataUrl: string | null = null
  try {
    const resp = await fetch('/pcu-logo.jpeg')
    if (resp.ok) {
      const blob = await resp.blob()
      logoDataUrl = await new Promise<string>((res) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result as string)
        reader.readAsDataURL(blob)
      })
    }
  } catch { /* logo not available */ }

  // ── TITLE PAGE (no page number shown) ──────────────────
  y.v = 55
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', PAGE_W / 2 - 18, y.v, 36, 36)
    y.v += 44
  }
  doc.setFont(FONT, 'bold')
  doc.setFontSize(13)
  doc.text('PRECIOUS CORNERSTONE UNIVERSITY, IBADAN', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 7
  doc.text('DEPARTMENT OF CYBER SECURITY', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 26

  doc.setFontSize(28)
  doc.text('DOBERMAN', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 12

  doc.setFont(FONT, 'normal')
  doc.setFontSize(12)
  const subtitle = doc.splitTextToSize(
    'Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform',
    USABLE_W - 20,
  )
  doc.text(subtitle, PAGE_W / 2, y.v, { align: 'center' })
  y.v += subtitle.length * 7 + 20

  doc.setFontSize(12)
  doc.text('A Final Year Project Submitted in Partial Fulfilment of the', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 7
  doc.text('Requirements for the Award of Bachelor of Science (B.Sc.) in', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 7
  doc.text('Cyber Security', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 20

  doc.setFont(FONT, 'bold')
  doc.text('BY', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 10

  doc.setFontSize(14)
  doc.text('OLUSANU JOSHUA BANKOLE', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 8
  doc.setFontSize(12)
  doc.setFont(FONT, 'normal')
  doc.text('Matric No: 2022/493', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 20

  doc.text('Supervisor: Dr. Osutokun Kemi', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 16

  doc.text('2025/2026 Academic Session', PAGE_W / 2, y.v, { align: 'center' })

  // ── DECLARATION (Roman: i) ──────────────────────────────
  doc.addPage(); physPage.n++
  y.v = TOP + 15
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('DECLARATION', PAGE_W / 2, y.v, { align: 'center' }); y.v += 16
  addFrontBody(doc, 'I, Olusanu Joshua Bankole, hereby declare that this project report, submitted to the Department of Cyber Security, Precious Cornerstone University, Ibadan, is the result of my own independent research and investigation. All sources consulted have been duly acknowledged in the references section. This work has not been previously submitted, in whole or in part, for any other degree or professional qualification at this institution or any other.', y, physPage, romanIdx)
  y.v += 20
  doc.setFont(FONT, 'normal'); doc.setFontSize(12)
  doc.text('Signature: ___________________________     Date: _______________', LEFT, y.v); y.v += 14
  doc.text('Olusanu Joshua Bankole', LEFT, y.v); y.v += 8
  doc.text('Matric No: 2022/493', LEFT, y.v)
  writeFrontFooter(doc, romanIdx.n) // i

  // ── CERTIFICATION (Roman: ii) ───────────────────────────
  doc.addPage(); physPage.n++; romanIdx.n++
  y.v = TOP + 15
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('CERTIFICATION', PAGE_W / 2, y.v, { align: 'center' }); y.v += 16
  addFrontBody(doc, 'This is to certify that this project report titled "DOBERMAN: Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform" was carried out by Olusanu Joshua Bankole under my supervision. I certify that the work is adequate in scope and quality in partial fulfilment of the requirements for the award of Bachelor of Science (B.Sc.) in Cyber Security at Precious Cornerstone University, Ibadan.', y, physPage, romanIdx)
  y.v += 20
  doc.setFont(FONT, 'bold'); doc.setFontSize(12)
  doc.text('Dr. Osutokun Kemi', LEFT, y.v); y.v += 8
  doc.setFont(FONT, 'normal')
  doc.text('Project Supervisor', LEFT, y.v); y.v += 7
  doc.text('Department of Cyber Security', LEFT, y.v); y.v += 7
  doc.text('Precious Cornerstone University, Ibadan', LEFT, y.v); y.v += 20
  doc.text('Signature: ___________________________     Date: _______________', LEFT, y.v)
  writeFrontFooter(doc, romanIdx.n) // ii

  // ── DEDICATION (Roman: iii) ─────────────────────────────
  doc.addPage(); physPage.n++; romanIdx.n++
  y.v = TOP + 60
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('DEDICATION', PAGE_W / 2, y.v, { align: 'center' }); y.v += 20
  REPORT.dedication.split('\n\n').forEach((para) => {
    doc.setFont(FONT, 'italic'); doc.setFontSize(12)
    const lines = doc.splitTextToSize(para, USABLE_W)
    doc.text(lines, PAGE_W / 2, y.v, { align: 'center' })
    y.v += lines.length * 10 + 6
  })
  writeFrontFooter(doc, romanIdx.n) // iii

  // ── ABSTRACT (Roman: iv) ────────────────────────────────
  doc.addPage(); physPage.n++; romanIdx.n++
  y.v = TOP + 15
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('ABSTRACT', PAGE_W / 2, y.v, { align: 'center' }); y.v += 16
  REPORT.abstract.split('\n\n').forEach((para) => addFrontBody(doc, para, y, physPage, romanIdx))
  y.v += 6
  doc.setFont(FONT, 'bold'); doc.setFontSize(12)
  const kwLabel = 'Keywords: '
  doc.text(kwLabel, LEFT, y.v)
  doc.setFont(FONT, 'normal')
  const kwText = doc.splitTextToSize(REPORT.keywords.join(', '), USABLE_W - doc.getTextWidth(kwLabel))
  doc.text(kwText, LEFT + doc.getTextWidth(kwLabel), y.v)
  writeFrontFooter(doc, romanIdx.n) // iv

  // ── ACKNOWLEDGEMENTS (Roman: v) ─────────────────────────
  doc.addPage(); physPage.n++; romanIdx.n++
  y.v = TOP + 15
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('ACKNOWLEDGEMENTS', PAGE_W / 2, y.v, { align: 'center' }); y.v += 16
  REPORT.acknowledgements.split('\n\n').forEach((para) => addFrontBody(doc, para, y, physPage, romanIdx))
  writeFrontFooter(doc, romanIdx.n) // v

  // ── TABLE OF CONTENTS placeholder (Roman: vi) ──────────
  doc.addPage(); physPage.n++; romanIdx.n++
  const tocPhysPage = physPage.n
  writeFrontFooter(doc, romanIdx.n) // vi
  // (Content written later via setPage)

  // ── CHAPTERS (Arabic page numbers, starting at 1) ───────
  arabic.n = 1 // reset Arabic counter

  for (const chapter of REPORT.chapters) {
    addChapterHeading(doc, chapter.number, chapter.title, y, physPage, arabic, toc)
    for (const section of chapter.sections) {
      addSectionHeading(doc, section.heading, y, physPage, arabic, toc)
      section.body.forEach((para) => addBody(doc, para, y, physPage, arabic))
    }
    writeBodyFooter(doc, arabic.n)
  }

  // ── REFERENCES ──────────────────────────────────────────
  writeBodyFooter(doc, arabic.n)
  doc.addPage(); physPage.n++; arabic.n++
  y.v = TOP + 15
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('REFERENCES', PAGE_W / 2, y.v, { align: 'center' }); y.v += 16
  REPORT.references.forEach((ref) => {
    const refText = `[${ref.number}]  ${ref.citation}`
    addBody(doc, refText, y, physPage, arabic, 11)
  })
  writeBodyFooter(doc, arabic.n)

  // ── APPENDICES ──────────────────────────────────────────
  for (const app of REPORT.appendices) {
    writeBodyFooter(doc, arabic.n)
    doc.addPage(); physPage.n++; arabic.n++
    y.v = TOP + 15
    doc.setFont(FONT, 'bold'); doc.setFontSize(14)
    doc.text(app.title.toUpperCase(), PAGE_W / 2, y.v, { align: 'center' }); y.v += 16
    app.content.forEach((para) => {
      const isCode = para.includes('\n') && (para.includes('CREATE') || para.includes('Deno.serve') || para.includes('//'))
      if (isCode) {
        doc.setFont('courier', 'normal'); doc.setFontSize(9)
        const lines = doc.splitTextToSize(para, USABLE_W)
        for (const line of lines) {
          if (y.v + 5 > PAGE_H - BOT - 16) {
            writeBodyFooter(doc, arabic.n); doc.addPage(); physPage.n++; arabic.n++; y.v = TOP + 15
          }
          doc.text(line, LEFT, y.v); y.v += 5
        }
        y.v += 6
      } else {
        addBody(doc, para, y, physPage, arabic)
      }
    })
    writeBodyFooter(doc, arabic.n)
  }

  // ── Write TOC onto its reserved page ────────────────────
  drawToc(doc, tocPhysPage, toc)

  doc.save('DOBERMAN_Technical_Report_Olusanu_Joshua_Bankole.pdf')
}
