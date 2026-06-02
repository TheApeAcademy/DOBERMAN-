import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip,
} from 'docx'
import { REPORT } from '../data/reportContent'

const FONT = 'Times New Roman'
const FONT_SIZE = 24 // half-points (12pt)
const HEADING1_SIZE = 28 // 14pt
const HEADING2_SIZE = 24 // 12pt bold
const LINE_SPACING = { line: 480, lineRule: 'auto' as const } // double spacing

function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: FONT_SIZE })],
    spacing: { ...LINE_SPACING, before: 0, after: 240 },
    indent: { firstLine: convertInchesToTwip(0.5) },
    alignment: AlignmentType.JUSTIFIED,
  })
}

function chapterHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: FONT, size: HEADING1_SIZE, bold: true })],
    spacing: { before: 480, after: 240 },
    pageBreakBefore: true,
    alignment: AlignmentType.LEFT,
  })
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: HEADING2_SIZE, bold: true })],
    spacing: { before: 360, after: 120 },
    alignment: AlignmentType.LEFT,
  })
}

function centredTitle(text: string, size: number, bold = false): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: size * 2, bold })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
  })
}

function blankLine(): Paragraph {
  return new Paragraph({ children: [new TextRun({ text: '', font: FONT, size: FONT_SIZE })], spacing: { before: 0, after: 120 } })
}

export async function downloadDocx() {
  const sections: Paragraph[] = []

  // ── TITLE PAGE ──
  sections.push(blankLine(), blankLine(), blankLine())
  sections.push(centredTitle('PRECIOUS CORNERSTONE UNIVERSITY, IBADAN', 12, true))
  sections.push(centredTitle('DEPARTMENT OF CYBER SECURITY', 12, true))
  sections.push(blankLine(), blankLine())
  sections.push(centredTitle('DOBERMAN', 22, true))
  sections.push(centredTitle('Design and Implementation of a Multi-Module AI-Powered', 14, false))
  sections.push(centredTitle('Cybersecurity Intelligence Platform', 14, false))
  sections.push(blankLine(), blankLine(), blankLine())
  sections.push(centredTitle('A Final Year Project Submitted in Partial Fulfilment of', 12, false))
  sections.push(centredTitle('the Requirements for the Award of Bachelor of Science Degree in', 12, false))
  sections.push(centredTitle('Cyber Security', 12, false))
  sections.push(blankLine(), blankLine())
  sections.push(centredTitle('BY', 12, false))
  sections.push(blankLine())
  sections.push(centredTitle('OLUSANU JOSHUA BANKOLE', 13, true))
  sections.push(centredTitle('MATRIC NO: 2022/493', 12, false))
  sections.push(blankLine(), blankLine())
  sections.push(centredTitle('SUPERVISOR', 12, false))
  sections.push(centredTitle('Dr. Osutokun Kemi', 12, true))
  sections.push(blankLine(), blankLine())
  sections.push(centredTitle('2025/2026 ACADEMIC SESSION', 12, false))

  // ── PAGE BREAK → DECLARATION ──
  sections.push(new Paragraph({ children: [new PageBreak()] }))
  sections.push(new Paragraph({
    children: [new TextRun({ text: 'DECLARATION', font: FONT, size: 28, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 },
  }))
  sections.push(bodyParagraph('I, Olusanu Joshua Bankole, hereby declare that this project report, submitted to the Department of Cyber Security, Precious Cornerstone University, Ibadan, is the result of my own independent research and investigation. All sources consulted have been duly acknowledged in the references section. This work has not been previously submitted, in whole or in part, for any other degree or professional qualification at this institution or any other.'))
  sections.push(blankLine(), blankLine())
  sections.push(bodyParagraph('Signature: ___________________________     Date: _______________'))
  sections.push(bodyParagraph('Olusanu Joshua Bankole'))
  sections.push(bodyParagraph('Matric No: 2022/493'))

  // ── CERTIFICATION ──
  sections.push(new Paragraph({ children: [new PageBreak()] }))
  sections.push(new Paragraph({
    children: [new TextRun({ text: 'CERTIFICATION', font: FONT, size: 28, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 },
  }))
  sections.push(bodyParagraph('This is to certify that this project report titled "DOBERMAN: Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform" was carried out by Olusanu Joshua Bankole under my supervision. I hereby certify that the work is adequate in scope and quality in partial fulfilment of the requirements for the award of Bachelor of Science (B.Sc.) in Cyber Security.'))
  sections.push(blankLine(), blankLine())
  sections.push(bodyParagraph('Dr. Osutokun Kemi'))
  sections.push(bodyParagraph('Project Supervisor'))
  sections.push(bodyParagraph('Department of Cyber Security'))
  sections.push(bodyParagraph('Precious Cornerstone University, Ibadan'))
  sections.push(blankLine())
  sections.push(bodyParagraph('Signature: ___________________________     Date: _______________'))

  // ── DEDICATION ──
  sections.push(new Paragraph({ children: [new PageBreak()] }))
  sections.push(new Paragraph({
    children: [new TextRun({ text: 'DEDICATION', font: FONT, size: 28, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 },
  }))
  REPORT.dedication.split('\n\n').forEach((para) => {
    sections.push(new Paragraph({
      children: [new TextRun({ text: para, font: FONT, size: FONT_SIZE, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }))
  })

  // ── ABSTRACT ──
  sections.push(new Paragraph({ children: [new PageBreak()] }))
  sections.push(new Paragraph({
    children: [new TextRun({ text: 'ABSTRACT', font: FONT, size: 28, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 },
  }))
  REPORT.abstract.split('\n\n').forEach((para) => sections.push(bodyParagraph(para)))
  sections.push(blankLine())
  sections.push(new Paragraph({
    children: [
      new TextRun({ text: 'Keywords: ', font: FONT, size: FONT_SIZE, bold: true }),
      new TextRun({ text: REPORT.keywords.join(', '), font: FONT, size: FONT_SIZE }),
    ],
    spacing: { before: 0, after: 240 },
  }))

  // ── ACKNOWLEDGEMENTS ──
  sections.push(new Paragraph({ children: [new PageBreak()] }))
  sections.push(new Paragraph({
    children: [new TextRun({ text: 'ACKNOWLEDGEMENTS', font: FONT, size: 28, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 },
  }))
  REPORT.acknowledgements.split('\n\n').forEach((para) => sections.push(bodyParagraph(para)))

  // ── CHAPTERS ──
  for (const chapter of REPORT.chapters) {
    sections.push(chapterHeading(`CHAPTER ${chapter.number}: ${chapter.title.toUpperCase()}`))
    for (const section of chapter.sections) {
      sections.push(sectionHeading(section.heading))
      section.body.forEach((para) => sections.push(bodyParagraph(para)))
    }
  }

  // ── REFERENCES ──
  sections.push(new Paragraph({ children: [new PageBreak()] }))
  sections.push(chapterHeading('REFERENCES'))
  REPORT.references.forEach((ref) => {
    sections.push(new Paragraph({
      children: [
        new TextRun({ text: `[${ref.number}] `, font: FONT, size: FONT_SIZE, bold: true }),
        new TextRun({ text: ref.citation, font: FONT, size: FONT_SIZE }),
      ],
      spacing: { before: 0, after: 160 },
      indent: { hanging: convertInchesToTwip(0.5), left: convertInchesToTwip(0.5) },
    }))
  })

  // ── APPENDICES ──
  for (const app of REPORT.appendices) {
    sections.push(new Paragraph({ children: [new PageBreak()] }))
    sections.push(chapterHeading(app.title.toUpperCase()))
    app.content.forEach((para) => {
      if (para.includes('\n') && (para.includes('CREATE') || para.includes('Deno.serve') || para.includes('//'))) {
        // Code block
        sections.push(new Paragraph({
          children: [new TextRun({ text: para, font: 'Courier New', size: 18 })],
          spacing: { before: 120, after: 120 },
          indent: { left: convertInchesToTwip(0.5) },
        }))
      } else {
        sections.push(bodyParagraph(para))
      }
    })
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: FONT_SIZE },
          paragraph: { spacing: LINE_SPACING },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
              right: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'DOBERMAN — Cybersecurity Intelligence Platform', font: FONT, size: 18, italics: true })],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 0 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0 },
              }),
            ],
          }),
        },
        children: sections,
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
