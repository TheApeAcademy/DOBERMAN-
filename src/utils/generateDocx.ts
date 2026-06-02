import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Footer,
  PageNumber,
  convertInchesToTwip,
  TabStopPosition,
  TabStopType,
  LeaderType,
  ImageRun,
} from 'docx'
import { REPORT } from '../data/reportContent'

const FONT = 'Times New Roman'
const SIZE_BODY = 24          // half-points → 12pt
const SIZE_H1   = 28          // 14pt — chapter headings
const SIZE_H2   = 24          // 12pt bold — section headings
const SIZE_SM   = 20          // 10pt — footnotes / captions
const DBL: { line: number; lineRule: 'auto' } = { line: 480, lineRule: 'auto' }

// Word-form chapter numbers
const CH_WORDS: Record<string, string> = {
  '1':'ONE','2':'TWO','3':'THREE','4':'FOUR','5':'FIVE',
  '6':'SIX','7':'SEVEN','8':'EIGHT','9':'NINE','10':'TEN',
}

// ── Paragraph helpers ──────────────────────────────────────

function body(text: string, italic = false): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: SIZE_BODY, italics: italic })],
    spacing: { ...DBL, before: 0, after: 200 },
    alignment: AlignmentType.JUSTIFIED,
  })
}

function centred(text: string, size: number, bold = false, italic = false, spaceAfter = 120): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: size * 2, bold, italics: italic })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: spaceAfter },
  })
}

function blank(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '', font: FONT, size: SIZE_BODY })],
    spacing: { before: 0, after: 200 },
  })
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] })
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: SIZE_H1, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
  })
}

function chapterTitle(num: string, title: string): Paragraph[] {
  return [
    new Paragraph({
      children: [new TextRun({ text: `CHAPTER ${CH_WORDS[num] || num}`, font: FONT, size: SIZE_H1, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      pageBreakBefore: true,
    }),
    new Paragraph({
      children: [new TextRun({ text: title.toUpperCase(), font: FONT, size: SIZE_H1, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
    }),
  ]
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: SIZE_H2, bold: true })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 360, after: 120 },
  })
}

function referenceItem(num: number, citation: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `[${num}]`, font: FONT, size: SIZE_BODY, bold: true }),
      new TextRun({ text: `  ${citation}`, font: FONT, size: SIZE_BODY }),
    ],
    spacing: { before: 0, after: 160 },
    indent: { hanging: convertInchesToTwip(0.5), left: convertInchesToTwip(0.5) },
  })
}

// ── Manual TOC entries ─────────────────────────────────────
function tocEntry(label: string, pageStr: string, bold = false, indent = 0): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: label, font: FONT, size: SIZE_BODY, bold }),
      new TextRun({ text: '\t', font: FONT, size: SIZE_BODY }),
      new TextRun({ text: pageStr, font: FONT, size: SIZE_BODY }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
        leader: LeaderType.DOT,
      },
    ],
    indent: { left: convertInchesToTwip(indent) },
    spacing: { before: 0, after: bold ? 120 : 60 },
  })
}

// ── Main export ────────────────────────────────────────────
export async function downloadDocx() {
  const children: Paragraph[] = []

  // ── Try loading school logo ────────────────────────────
  let logoImageRun: ImageRun | null = null
  try {
    const resp = await fetch('/pcu-logo.jpeg')
    if (resp.ok) {
      const buf = await resp.arrayBuffer()
      logoImageRun = new ImageRun({
        data: buf,
        transformation: { width: 90, height: 90 },
        type: 'png',
      })
    }
  } catch { /* logo not available */ }

  // ── TITLE PAGE ────────────────────────────────────────
  children.push(blank(), blank())
  if (logoImageRun) {
    children.push(new Paragraph({
      children: [logoImageRun],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }))
  }
  children.push(centred('PRECIOUS CORNERSTONE UNIVERSITY, IBADAN', 13, true))
  children.push(centred('DEPARTMENT OF CYBER SECURITY', 13, true))
  children.push(blank(), blank())
  children.push(centred('DOBERMAN', 24, true))
  children.push(centred('Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform', 13, false))
  children.push(blank(), blank())
  children.push(centred('A Final Year Project Submitted in Partial Fulfilment of the Requirements for', 12))
  children.push(centred('the Award of Bachelor of Science (B.Sc.) in Cyber Security', 12))
  children.push(blank(), blank())
  children.push(centred('BY', 12, false))
  children.push(blank())
  children.push(centred('OLUSANU JOSHUA BANKOLE', 14, true))
  children.push(centred('MATRIC NO: 2022/493', 12))
  children.push(blank(), blank())
  children.push(centred('SUPERVISOR:', 12, true))
  children.push(centred('Dr. Osutokun Kemi', 12, true))
  children.push(blank(), blank())
  children.push(centred('2025/2026 ACADEMIC SESSION', 12, true))

  // ── DECLARATION ───────────────────────────────────────
  children.push(pageBreak())
  children.push(sectionTitle('DECLARATION'))
  children.push(body('I, Olusanu Joshua Bankole, hereby declare that this project report, submitted to the Department of Cyber Security, Precious Cornerstone University, Ibadan, is the result of my own independent research and investigation. All sources consulted have been duly acknowledged in the references section. This work has not been previously submitted, in whole or in part, for any other degree or professional qualification at this institution or any other.'))
  children.push(blank(), blank())
  children.push(body('Signature: ___________________________     Date: _______________'))
  children.push(body('Olusanu Joshua Bankole'))
  children.push(body('Matric No: 2022/493'))

  // ── CERTIFICATION ─────────────────────────────────────
  children.push(pageBreak())
  children.push(sectionTitle('CERTIFICATION'))
  children.push(body('This is to certify that this project report titled "DOBERMAN: Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform" was carried out by Olusanu Joshua Bankole under my supervision. I certify that the work is adequate in scope and quality in partial fulfilment of the requirements for the award of Bachelor of Science (B.Sc.) in Cyber Security at Precious Cornerstone University, Ibadan.'))
  children.push(blank(), blank())
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Dr. Osutokun Kemi', font: FONT, size: SIZE_BODY, bold: true })],
    spacing: { before: 0, after: 80 },
  }))
  children.push(body('Project Supervisor'))
  children.push(body('Department of Cyber Security'))
  children.push(body('Precious Cornerstone University, Ibadan'))
  children.push(blank())
  children.push(body('Signature: ___________________________     Date: _______________'))

  // ── DEDICATION ────────────────────────────────────────
  children.push(pageBreak())
  children.push(sectionTitle('DEDICATION'))
  REPORT.dedication.split('\n\n').forEach((para) => {
    children.push(new Paragraph({
      children: [new TextRun({ text: para, font: FONT, size: SIZE_BODY, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { ...DBL, before: 0, after: 240 },
    }))
  })

  // ── ABSTRACT ──────────────────────────────────────────
  children.push(pageBreak())
  children.push(sectionTitle('ABSTRACT'))
  REPORT.abstract.split('\n\n').forEach((para) => children.push(body(para)))
  children.push(blank())
  children.push(new Paragraph({
    children: [
      new TextRun({ text: 'Keywords: ', font: FONT, size: SIZE_BODY, bold: true }),
      new TextRun({ text: REPORT.keywords.join(', '), font: FONT, size: SIZE_BODY }),
    ],
    spacing: { before: 0, after: 200 },
  }))

  // ── ACKNOWLEDGEMENTS ──────────────────────────────────
  children.push(pageBreak())
  children.push(sectionTitle('ACKNOWLEDGEMENTS'))
  REPORT.acknowledgements.split('\n\n').forEach((para) => children.push(body(para)))

  // ── TABLE OF CONTENTS (manual) ────────────────────────
  children.push(pageBreak())
  children.push(sectionTitle('TABLE OF CONTENTS'))

  // Front matter
  children.push(tocEntry('Declaration', 'i'))
  children.push(tocEntry('Certification', 'ii'))
  children.push(tocEntry('Dedication', 'iii'))
  children.push(tocEntry('Abstract', 'iv'))
  children.push(tocEntry('Acknowledgements', 'v'))
  children.push(tocEntry('Table of Contents', 'vi'))
  children.push(blank())

  // Chapters (approximate page numbers — will be accurate after examiner prints)
  const approxPages: Record<string, number> = {
    '1': 1, '2': 9, '3': 17, '4': 26, '5': 35, '6': 50, '7': 62,
  }
  for (const ch of REPORT.chapters) {
    const startPage = approxPages[ch.number] ?? 1
    children.push(tocEntry(`Chapter ${CH_WORDS[ch.number] || ch.number}: ${ch.title}`, String(startPage), true))
    let secPage = startPage
    for (const sec of ch.sections) {
      children.push(tocEntry(sec.heading, String(secPage + 1), false, 0.3))
      secPage += 2
    }
    children.push(blank())
  }
  children.push(tocEntry('References', '70', true))
  children.push(tocEntry('Appendix A: Database Schema', '74'))
  children.push(tocEntry('Appendix B: Edge Function Excerpts', '76'))
  children.push(tocEntry('Appendix C: System Screenshots', '78'))
  children.push(tocEntry('Appendix D: User Testing Questionnaire', '79'))

  // ── CHAPTERS ──────────────────────────────────────────
  for (const chapter of REPORT.chapters) {
    children.push(...chapterTitle(chapter.number, chapter.title))
    for (const section of chapter.sections) {
      children.push(sectionHeading(section.heading))
      section.body.forEach((para) => children.push(body(para)))
    }
  }

  // ── REFERENCES ────────────────────────────────────────
  children.push(pageBreak())
  children.push(sectionTitle('REFERENCES'))
  REPORT.references.forEach((ref) => children.push(referenceItem(ref.number, ref.citation)))

  // ── APPENDICES ────────────────────────────────────────
  for (const app of REPORT.appendices) {
    children.push(pageBreak())
    children.push(sectionTitle(app.title.toUpperCase()))
    app.content.forEach((para) => {
      const isCode = para.includes('\n') && (para.includes('CREATE') || para.includes('Deno.serve') || para.includes('//'))
      if (isCode) {
        children.push(new Paragraph({
          children: [new TextRun({ text: para, font: 'Courier New', size: 18 })],
          spacing: { before: 120, after: 120 },
          indent: { left: convertInchesToTwip(0.5) },
        }))
      } else {
        children.push(body(para))
      }
    })
  }

  // ── Build document ────────────────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_BODY },
          paragraph: { spacing: DBL },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top:    convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left:   convertInchesToTwip(1.5),  // binding margin
              right:  convertInchesToTwip(1),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: SIZE_SM })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children,
      },
    ],
  })

  const { Packer } = await import('docx')
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'DOBERMAN_Technical_Report_Olusanu_Joshua_Bankole.docx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
