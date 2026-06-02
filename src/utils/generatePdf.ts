import jsPDF from 'jspdf'
import { REPORT } from '../data/reportContent'

const MARGIN = 25.4 // 1 inch in mm
const PAGE_W = 210
const PAGE_H = 297
const USABLE_W = PAGE_W - MARGIN * 2
const FONT = 'times'

function addPage(doc: jsPDF, pageNum: { n: number }) {
  doc.addPage()
  pageNum.n++
}

function writeFooter(doc: jsPDF, pageNum: { n: number }) {
  doc.setFont(FONT, 'italic')
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text('DOBERMAN — Cybersecurity Intelligence Platform', PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' })
  doc.text(String(pageNum.n), PAGE_W / 2, PAGE_H - 10, { align: 'center' })
  doc.setTextColor(0, 0, 0)
}

function addBody(
  doc: jsPDF,
  text: string,
  y: { v: number },
  pageNum: { n: number },
  fontSize = 12,
  bold = false,
  italic = false,
  indent = true,
): number {
  doc.setFont(FONT, bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal')
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(text, USABLE_W - (indent ? 12.7 : 0))
  const lineH = fontSize * 0.5 * 1.8 // ~double spacing

  for (const line of lines) {
    if (y.v + lineH > PAGE_H - MARGIN - 15) {
      writeFooter(doc, pageNum)
      addPage(doc, pageNum)
      y.v = MARGIN + 15
    }
    doc.text(line, MARGIN + (indent ? 12.7 : 0), y.v)
    y.v += lineH
  }
  y.v += lineH * 0.5
  return y.v
}

function addHeading1(doc: jsPDF, text: string, y: { v: number }, pageNum: { n: number }) {
  writeFooter(doc, pageNum)
  addPage(doc, pageNum)
  y.v = MARGIN + 15
  doc.setFont(FONT, 'bold')
  doc.setFontSize(16)
  doc.text(text, MARGIN, y.v)
  y.v += 16
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y.v, PAGE_W - MARGIN, y.v)
  y.v += 10
}

function addHeading2(doc: jsPDF, text: string, y: { v: number }, pageNum: { n: number }) {
  if (y.v + 25 > PAGE_H - MARGIN - 15) {
    writeFooter(doc, pageNum)
    addPage(doc, pageNum)
    y.v = MARGIN + 15
  }
  y.v += 6
  doc.setFont(FONT, 'bold')
  doc.setFontSize(12)
  doc.text(text, MARGIN, y.v)
  y.v += 8
}

export async function downloadPdf() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const y = { v: MARGIN }
  const pageNum = { n: 1 }

  // ── TITLE PAGE ──
  doc.setFont(FONT, 'bold')
  doc.setFontSize(13)
  y.v = 60
  doc.text('PRECIOUS CORNERSTONE UNIVERSITY, IBADAN', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 7
  doc.text('DEPARTMENT OF CYBER SECURITY', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 30
  doc.setFontSize(28)
  doc.text('DOBERMAN', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 12
  doc.setFont(FONT, 'normal')
  doc.setFontSize(13)
  const subtitle = doc.splitTextToSize('Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform', USABLE_W - 20)
  doc.text(subtitle, PAGE_W / 2, y.v, { align: 'center' })
  y.v += subtitle.length * 8 + 20
  doc.setFontSize(12)
  doc.text('A Final Year Project Submitted in Partial Fulfilment of', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 6
  doc.text('the Requirements for the Award of B.Sc. in Cyber Security', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 20
  doc.setFont(FONT, 'bold')
  doc.text('BY', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 8
  doc.setFontSize(14)
  doc.text('OLUSANU JOSHUA BANKOLE', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 7
  doc.setFontSize(12)
  doc.setFont(FONT, 'normal')
  doc.text('Matric No: 2022/493', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 20
  doc.text('Supervisor: Dr. Osutokun Kemi', PAGE_W / 2, y.v, { align: 'center' })
  y.v += 15
  doc.text('2025/2026 Academic Session', PAGE_W / 2, y.v, { align: 'center' })

  // ── DECLARATION ──
  doc.addPage(); pageNum.n++; y.v = MARGIN + 15
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('DECLARATION', PAGE_W / 2, y.v, { align: 'center' }); y.v += 14
  addBody(doc, 'I, Olusanu Joshua Bankole, hereby declare that this project report, submitted to the Department of Cyber Security, Precious Cornerstone University, Ibadan, is the result of my own independent research and investigation. All sources consulted have been duly acknowledged in the references section. This work has not been previously submitted, in whole or in part, for any other degree or professional qualification.', y, pageNum)
  y.v += 20
  addBody(doc, 'Signature: ___________________________     Date: _______________', y, pageNum, 12, false, false, false)
  addBody(doc, 'Olusanu Joshua Bankole', y, pageNum, 12, false, false, false)
  addBody(doc, 'Matric No: 2022/493', y, pageNum, 12, false, false, false)
  writeFooter(doc, pageNum)

  // ── CERTIFICATION ──
  doc.addPage(); pageNum.n++; y.v = MARGIN + 15
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('CERTIFICATION', PAGE_W / 2, y.v, { align: 'center' }); y.v += 14
  addBody(doc, 'This is to certify that this project report titled "DOBERMAN: Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform" was carried out by Olusanu Joshua Bankole under my supervision and is adequate in scope and quality in partial fulfilment of the requirements for the award of B.Sc. in Cyber Security.', y, pageNum)
  y.v += 20
  addBody(doc, 'Dr. Osutokun Kemi', y, pageNum, 12, true, false, false)
  addBody(doc, 'Project Supervisor', y, pageNum, 12, false, false, false)
  addBody(doc, 'Precious Cornerstone University, Ibadan', y, pageNum, 12, false, false, false)
  y.v += 12
  addBody(doc, 'Signature: ___________________________     Date: _______________', y, pageNum, 12, false, false, false)
  writeFooter(doc, pageNum)

  // ── DEDICATION ──
  doc.addPage(); pageNum.n++; y.v = MARGIN + 60
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('DEDICATION', PAGE_W / 2, y.v, { align: 'center' }); y.v += 20
  REPORT.dedication.split('\n\n').forEach((para) => {
    doc.setFont(FONT, 'italic'); doc.setFontSize(12)
    const lines = doc.splitTextToSize(para, USABLE_W)
    doc.text(lines, PAGE_W / 2, y.v, { align: 'center' })
    y.v += lines.length * 8 + 6
  })
  writeFooter(doc, pageNum)

  // ── ABSTRACT ──
  doc.addPage(); pageNum.n++; y.v = MARGIN + 15
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('ABSTRACT', PAGE_W / 2, y.v, { align: 'center' }); y.v += 14
  REPORT.abstract.split('\n\n').forEach((para) => addBody(doc, para, y, pageNum))
  y.v += 4
  doc.setFont(FONT, 'bold'); doc.setFontSize(12)
  doc.text('Keywords: ', MARGIN, y.v)
  doc.setFont(FONT, 'normal')
  doc.text(REPORT.keywords.join(', '), MARGIN + 24, y.v)
  y.v += 8
  writeFooter(doc, pageNum)

  // ── ACKNOWLEDGEMENTS ──
  doc.addPage(); pageNum.n++; y.v = MARGIN + 15
  doc.setFont(FONT, 'bold'); doc.setFontSize(14)
  doc.text('ACKNOWLEDGEMENTS', PAGE_W / 2, y.v, { align: 'center' }); y.v += 14
  REPORT.acknowledgements.split('\n\n').forEach((para) => addBody(doc, para, y, pageNum))
  writeFooter(doc, pageNum)

  // ── CHAPTERS ──
  for (const chapter of REPORT.chapters) {
    addHeading1(doc, `CHAPTER ${chapter.number}: ${chapter.title.toUpperCase()}`, y, pageNum)
    for (const section of chapter.sections) {
      addHeading2(doc, section.heading, y, pageNum)
      section.body.forEach((para) => addBody(doc, para, y, pageNum))
    }
    writeFooter(doc, pageNum)
  }

  // ── REFERENCES ──
  addHeading1(doc, 'REFERENCES', y, pageNum)
  REPORT.references.forEach((ref) => {
    addBody(doc, `[${ref.number}] ${ref.citation}`, y, pageNum, 11, false, false, false)
  })
  writeFooter(doc, pageNum)

  // ── APPENDICES ──
  for (const app of REPORT.appendices) {
    addHeading1(doc, app.title.toUpperCase(), y, pageNum)
    app.content.forEach((para) => {
      if (para.includes('\n') && (para.includes('CREATE') || para.includes('Deno.serve') || para.includes('//'))) {
        doc.setFont('courier', 'normal')
        doc.setFontSize(9)
        const lines = doc.splitTextToSize(para, USABLE_W)
        for (const line of lines) {
          if (y.v + 6 > PAGE_H - MARGIN - 15) {
            writeFooter(doc, pageNum); addPage(doc, pageNum); y.v = MARGIN + 15
          }
          doc.text(line, MARGIN, y.v); y.v += 5
        }
        y.v += 6
      } else {
        addBody(doc, para, y, pageNum)
      }
    })
    writeFooter(doc, pageNum)
  }

  doc.save('DOBERMAN_Technical_Report_Olusanu_Joshua_Bankole.pdf')
}
