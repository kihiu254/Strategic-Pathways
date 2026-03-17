import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const publicDir = path.join(appRoot, 'public');
const outDir = path.join(publicDir, 'docs');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outputPath = path.join(outDir, 'strategic-pathways-letterhead.pdf');
const logoPath = path.join(publicDir, 'logo.png');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 54, bottom: 54, left: 54, right: 54 }
});

doc.pipe(fs.createWriteStream(outputPath));

const getPageMetrics = () => ({
  pageWidth: doc.page.width,
  pageHeight: doc.page.height
});

const colors = {
  navy: '#0b2a3c',
  accent: '#C89F5E',
  light: '#f6f2ea',
  text: '#1d2b34',
  muted: '#6b7784'
};

const inset = 28;
const headerHeight = 140;

const drawHeader = () => {
  const { pageWidth } = getPageMetrics();
  doc.rect(0, 0, pageWidth, headerHeight).fill(colors.navy);
  doc.rect(0, headerHeight, pageWidth, 6).fill(colors.accent);

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 54, 24, { width: 78 });
  }

  const brandX = 150;
  doc
    .fillColor('white')
    .font('Helvetica-Bold')
    .fontSize(18)
    .text('Strategic Pathways', brandX, 28, { align: 'left' });

  doc
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor(colors.light)
    .text('Where Global Skills Come Full Circle', brandX, 52, { align: 'left' })
    .fontSize(9)
    .text('Pilot Programme - 2024-2025', brandX, 68, { align: 'left' });

  const contactX = pageWidth - 295;
  const contactY = 22;
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(colors.accent)
    .text('CONTACT', contactX, contactY, { align: 'left' });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('white')
    .text('Head Office: Kenya', contactX, contactY + 14)
    .text('Phone: +254 721 506886', contactX, contactY + 28)
    .text('Website: www.joinstrategicpathways.com', contactX, contactY + 42)
    .text('Email: info@joinstrategicpathways.com', contactX, contactY + 56)
    .text('Location: Nairobi, Kenya', contactX, contactY + 70);
};

const drawFooter = () => {
  const { pageWidth, pageHeight } = getPageMetrics();
  const footerHeight = 70;
  doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight).fill(colors.navy);
  doc.rect(0, pageHeight - footerHeight, pageWidth, 4).fill(colors.accent);

  const footerTextY = pageHeight - footerHeight + 18;
  const leftX = 64;
  doc
    .fillColor('white')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('Strategic Pathways | Where Global Skills Come Full Circle', leftX, footerTextY, {
      width: pageWidth - leftX * 2,
      align: 'left'
    });

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(colors.light)
    .text('info@joinstrategicpathways.com  |  www.joinstrategicpathways.com  |  +254 721 506886', leftX, footerTextY + 14, {
      width: pageWidth - leftX * 2,
      align: 'left'
    });

  const complianceText = 'Strategic Pathways is a registered professional network initiative. This letterhead is for official communications only.';
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(colors.light)
    .text(complianceText, leftX, footerTextY + 30, { width: pageWidth - leftX * 2, align: 'left' });

  const footerRightX = pageWidth - 210;
  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(colors.accent)
    .text('SOCIAL', footerRightX, footerTextY, { align: 'left' });

  doc
    .font('Helvetica')
    .fillColor(colors.light)
    .text('LinkedIn  |  X  |  Instagram', footerRightX, footerTextY + 12, { align: 'left' });
};

const drawFrame = () => {
  const { pageWidth, pageHeight } = getPageMetrics();
  doc.rect(inset, inset, pageWidth - inset * 2, pageHeight - inset * 2)
    .lineWidth(1)
    .strokeColor('#1b2f3e')
    .stroke();
};

const drawWatermark = () => {
  const { pageWidth, pageHeight } = getPageMetrics();
  if (fs.existsSync(logoPath)) {
    doc.save();
    doc.opacity(0.08);
    doc.image(logoPath, pageWidth / 2 - 120, pageHeight / 2 - 150, { width: 240 });
    doc.restore();
  }
};

drawFrame();
drawHeader();
drawFooter();
drawWatermark();

// Body content guide
const bodyStartY = headerHeight + 22;
const leftX = 64;
const rightX = getPageMetrics().pageWidth - 64;

// Reference block
const refBoxHeight = 110;
doc
  .roundedRect(leftX, bodyStartY, rightX - leftX, refBoxHeight, 12)
  .lineWidth(1)
  .strokeColor('#d7c6a7')
  .stroke();

const refPadding = 14;
const refY = bodyStartY + refPadding;
doc
  .font('Helvetica-Bold')
  .fontSize(10)
  .fillColor(colors.text)
  .text('Date:', leftX + refPadding, refY)
  .text('Reference:', leftX + refPadding, refY + 20)
  .text('Subject:', leftX + refPadding, refY + 40)
  .text('Recipient:', leftX + refPadding, refY + 60)
  .text('Programme:', leftX + refPadding, refY + 80);

doc
  .font('Helvetica')
  .fillColor(colors.muted)
  .text('March 17, 2026', leftX + 110, refY)
  .text('SP/CORR/2026/001', leftX + 110, refY + 20)
  .text('Strategic Pathways Partnership Overview', leftX + 110, refY + 40)
  .text('Amatha Clarena', leftX + 110, refY + 60)
  .text('Talent Execution & Brain Circulation', leftX + 110, refY + 80);

// Body content
const bodyTextY = bodyStartY + refBoxHeight + 18;
const bodyWidth = rightX - leftX;

doc
  .font('Helvetica')
  .fontSize(11)
  .fillColor(colors.text)
  .text('Dear Amatha Clarena,', leftX, bodyTextY, { width: bodyWidth });

const intro =
  "Strategic Pathways is Kenya's first dedicated platform for mobilising study-abroad returnees and diaspora experts into credible local projects. We bridge global knowledge with ground-level impact by creating a curated marketplace for talent, projects, and institutional partnerships.";
doc
  .font('Helvetica')
  .fontSize(11)
  .fillColor(colors.text)
  .text(intro, leftX, bodyTextY + 22, { width: bodyWidth, lineGap: 4 });

const problem =
  'Africa loses billions in potential annually as highly trained graduates return from world-class universities abroad only to find their skills underutilised. This cycle limits development and deprives counties, NGOs, and institutions of the expert capacity they need.';
doc.text(problem, leftX, bodyTextY + 90, { width: bodyWidth, lineGap: 4 });

doc
  .font('Helvetica-Bold')
  .fontSize(11)
  .fillColor(colors.text)
  .text('Who We Serve', leftX, bodyTextY + 156);

doc
  .font('Helvetica')
  .fontSize(10.5)
  .fillColor(colors.text)
  .text('- Returnees & Diaspora Experts seeking meaningful contribution to Kenya\'s development.', leftX, bodyTextY + 176, { width: bodyWidth })
  .text('- County Governments requiring skilled consultants for strategy and programme delivery.', leftX, bodyTextY + 194, { width: bodyWidth })
  .text('- Universities & Research Bodies embedding returnee talent into research partnerships.', leftX, bodyTextY + 212, { width: bodyWidth })
  .text('- NGOs & Donors that need vetted expertise for project implementation.', leftX, bodyTextY + 230, { width: bodyWidth });

doc
  .font('Helvetica-Bold')
  .fontSize(11)
  .fillColor(colors.text)
  .text('How It Works', leftX, bodyTextY + 254);

doc
  .font('Helvetica')
  .fontSize(10.5)
  .fillColor(colors.text)
  .text('1) Apply & Verify: We review for fit and credibility to ensure trusted membership.', leftX, bodyTextY + 274, { width: bodyWidth })
  .text('2) Connect & Collaborate: Join circles, attend briefings, and meet partners.', leftX, bodyTextY + 292, { width: bodyWidth })
  .text('3) Win Work & Grow: Bid on vetted projects and build a credible local portfolio.', leftX, bodyTextY + 310, { width: bodyWidth });

doc
  .font('Helvetica-Bold')
  .fontSize(11)
  .fillColor(colors.text)
  .text('Pilot Impact Targets (Year 1)', leftX, bodyTextY + 336);

doc
  .font('Helvetica')
  .fontSize(10.5)
  .fillColor(colors.text)
  .text('- 150+ professionals onboarded', leftX, bodyTextY + 356, { width: bodyWidth })
  .text('- 20+ institutional partners', leftX, bodyTextY + 374, { width: bodyWidth })
  .text('- 30+ pilot projects delivered', leftX, bodyTextY + 392, { width: bodyWidth })
  .text('- $500K+ income opportunities created', leftX, bodyTextY + 410, { width: bodyWidth });

// Signature block
// Second page
doc.addPage();
drawFrame();
drawHeader();
drawFooter();
drawWatermark();

const page2Top = headerHeight + 28;
doc
  .font('Helvetica-Bold')
  .fontSize(12)
  .fillColor(colors.text)
  .text('How It Works', leftX, page2Top);

doc
  .font('Helvetica')
  .fontSize(11)
  .fillColor(colors.text)
  .text('1) Apply & Verify: We review for fit and credibility to ensure trusted membership.', leftX, page2Top + 22, { width: rightX - leftX })
  .text('2) Connect & Collaborate: Join circles, attend briefings, and meet partners.', leftX, page2Top + 40, { width: rightX - leftX })
  .text('3) Win Work & Grow: Bid on vetted projects and build a credible local portfolio.', leftX, page2Top + 58, { width: rightX - leftX });

doc
  .font('Helvetica-Bold')
  .fontSize(12)
  .fillColor(colors.text)
  .text('Membership Tiers', leftX, page2Top + 90);

doc
  .font('Helvetica')
  .fontSize(10.5)
  .fillColor(colors.text)
  .text('Community (Free): Profile listing, monthly newsletter, event invites.', leftX, page2Top + 112, { width: rightX - leftX })
  .text('Professional ($100/yr or $10/mo): Everything in Community, project alerts, partner introductions, credibility badge.', leftX, page2Top + 130, { width: rightX - leftX })
  .text('Firm (Custom): Team onboarding, dedicated account support, co-branded opportunities.', leftX, page2Top + 148, { width: rightX - leftX });

doc
  .font('Helvetica-Bold')
  .fontSize(12)
  .fillColor(colors.text)
  .text('Pilot Impact Targets (Year 1)', leftX, page2Top + 180);

doc
  .font('Helvetica')
  .fontSize(10.5)
  .fillColor(colors.text)
  .text('- 150+ professionals onboarded', leftX, page2Top + 202)
  .text('- 20+ institutional partners', leftX, page2Top + 220)
  .text('- 30+ pilot projects delivered', leftX, page2Top + 238)
  .text('- $500K+ income opportunities created', leftX, page2Top + 256);

doc
  .font('Helvetica')
  .fontSize(11)
  .fillColor(colors.text)
  .text('We welcome your partnership in connecting Africa\'s global talent with local impact. Please reach out to schedule a briefing or collaboration session.', leftX, page2Top + 290, { width: rightX - leftX });

const signatureY = page2Top + 340;
doc
  .font('Helvetica-Bold')
  .text('Sincerely,', leftX, signatureY)
  .font('Helvetica')
  .fillColor(colors.muted)
  .text('Strategic Pathways Secretariat', leftX, signatureY + 22)
  .text('Kenya Talent Network', leftX, signatureY + 38)
  .text('We respond within 2 business days.', leftX, signatureY + 54);

doc.end();

console.log(`Letterhead saved to ${outputPath}`);
