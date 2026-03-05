import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUTPUT_PATH = path.join(process.cwd(), 'public', 'docs', 'Strategic_Pathways_Brief.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 60, bottom: 60, left: 65, right: 65 },
  info: {
    Title: 'Strategic Pathways – Platform Brief',
    Author: 'Strategic Pathways',
    Subject: 'Talent Execution & Venture-Building Platform',
  },
});

doc.pipe(fs.createWriteStream(OUTPUT_PATH));

// ── Colour palette ────────────────────────────────────────────────────────────
const NAVY    = '#0B2A3C';
const GOLD    = '#C89F5E';
const BEIGE   = '#F6F4EF';
const MUTED   = '#607B8B';
const WHITE   = '#FFFFFF';
const PAGE_W  = doc.page.width  - 65 * 2;   // usable width

// ── Helper: horizontal rule ───────────────────────────────────────────────────
function hr(y, color = GOLD, opacity = 0.6) {
  doc.save().opacity(opacity).moveTo(65, y).lineTo(65 + PAGE_W, y)
     .strokeColor(color).lineWidth(1).stroke().restore();
}

// ── COVER PAGE ────────────────────────────────────────────────────────────────
// Background
doc.rect(0, 0, doc.page.width, doc.page.height).fill(NAVY);

// Gold top stripe
doc.rect(0, 0, doc.page.width, 8).fill(GOLD);

// Title block
doc.moveDown(8);
doc.font('Helvetica-Bold').fontSize(38).fillColor(WHITE)
   .text('STRATEGIC PATHWAYS', 65, 180, { align: 'center', width: PAGE_W });

doc.font('Helvetica').fontSize(16).fillColor(GOLD)
   .text('Where Global Skills Come Full Circle', 65, 232, { align: 'center', width: PAGE_W });

hr(275, GOLD, 0.8);

doc.font('Helvetica').fontSize(13).fillColor(BEIGE)
   .text(
     'A talent execution and venture-building platform mobilising\nstudy-abroad returnees into impactful local projects that\nfoster sustainable brain circulation.',
     65, 295, { align: 'center', width: PAGE_W, lineGap: 5 }
   );

// Tag chips
const tags = ['Talent Execution', 'Brain Circulation', 'Venture Building', 'Kenya'];
const chipY = 395;
let chipX = 65;
tags.forEach(tag => {
  const tw = doc.widthOfString(tag, { fontSize: 10 }) + 22;
  doc.roundedRect(chipX, chipY, tw, 22, 5).strokeColor(GOLD).lineWidth(1).stroke();
  doc.font('Helvetica').fontSize(10).fillColor(GOLD)
     .text(tag, chipX + 11, chipY + 6, { width: tw - 22 });
  chipX += tw + 14;
});

// Pilot date
doc.font('Helvetica').fontSize(11).fillColor(MUTED)
   .text('Pilot Programme · 2024–2025', 65, 650, { align: 'center', width: PAGE_W });

doc.font('Helvetica').fontSize(10).fillColor(GOLD)
   .text('strategicpathways.co.ke  ·  hello@strategicpathways.co.ke', 65, 670, { align: 'center', width: PAGE_W });

// Gold bottom stripe
doc.rect(0, doc.page.height - 8, doc.page.width, 8).fill(GOLD);

// ── PAGE 2: OVERVIEW ─────────────────────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill(WHITE);
doc.rect(0, 0, doc.page.width, 8).fill(GOLD);

function sectionHeader(title, y) {
  doc.font('Helvetica-Bold').fontSize(20).fillColor(NAVY)
     .text(title, 65, y);
  hr(y + 28, GOLD, 0.5);
  return y + 44;
}

function bodyText(text, y, opts = {}) {
  doc.font('Helvetica').fontSize(11).fillColor('#1A2E3C')
     .text(text, 65, y, { width: PAGE_W, lineGap: 4, ...opts });
  return doc.y + 10;
}

// Section: The Problem
let y = sectionHeader('The Problem', 60);
y = bodyText(
  'Africa loses billions in potential annually as highly-trained graduates return from world-class universities abroad, only to find their skills underutilised. This "brain drain" cycle stifles development and leaves counties, NGOs, and institutions without the expert capacity they need.',
  y
);

// Section: Our Solution
y = sectionHeader('Our Solution', y + 20);
y = bodyText(
  'Strategic Pathways is Kenya\'s first dedicated platform for mobilising study-abroad returnees and diaspora experts into credible local projects. We bridge the gap between global knowledge and ground-level impact by creating a curated marketplace for talent, projects, and institutional partnerships.',
  y
);

// Section: Who We Serve
y = sectionHeader('Who We Serve', y + 20);

const audiences = [
  ['▸  Returnees & Diaspora Experts', 'Professionals who studied or worked abroad and want to contribute meaningfully to Kenya\'s development.'],
  ['▸  County Governments', 'Public institutions seeking skilled consultants for strategy, digital transformation, and programme delivery.'],
  ['▸  Universities & Research Bodies', 'Academic institutions looking to embed returnee talent into research partnerships and pilot programmes.'],
  ['▸  NGOs & Donors', 'Development organisations that require vetted, credible expertise for project implementation.'],
];

audiences.forEach(([title, desc]) => {
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text(title, 65, y, { width: PAGE_W });
  y = doc.y;
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(desc, 80, y, { width: PAGE_W - 15, lineGap: 3 });
  y = doc.y + 12;
});

// ── PAGE 3: HOW IT WORKS + MEMBERSHIP ────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill(WHITE);
doc.rect(0, 0, doc.page.width, 8).fill(GOLD);

y = sectionHeader('How It Works', 60);

const steps = [
  ['01  Apply & Verify', 'Share your background. We review for fit and credibility — ensuring our community is trusted by institutions.'],
  ['02  Connect & Collaborate', 'Join circles, attend briefings, and meet partners. Network with professionals who share your commitment to impact.'],
  ['03  Win Work & Grow', 'Bid on vetted projects, join expert teams, and track your contribution. Build a credible local portfolio.'],
];

steps.forEach(([title, desc], i) => {
  // Step number circle
  doc.circle(80, y + 10, 14).fill(GOLD);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(WHITE)
     .text(`0${i+1}`, 73, y + 5, { width: 14, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY)
     .text(title.replace(/^\d+\s+/, ''), 105, y);
  y = doc.y + 2;
  doc.font('Helvetica').fontSize(10).fillColor(MUTED)
     .text(desc, 105, y, { width: PAGE_W - 40, lineGap: 3 });
  y = doc.y + 16;
});

// Section: Membership Tiers
y = sectionHeader('Membership Tiers', y + 10);

const tiers = [
  { name: 'Community', price: 'Free', color: MUTED, features: ['Profile listing', 'Monthly newsletter', 'Event invites'] },
  { name: 'Professional', price: '$100/yr · $10/mo', color: GOLD, features: ['Everything in Community', 'Project alerts + early access', 'Partner introductions', 'Credibility badge'] },
  { name: 'Firm', price: 'Custom', color: NAVY, features: ['Team onboarding', 'Dedicated account support', 'Co-branded opportunities'] },
];

const tierW = (PAGE_W - 20) / 3;
tiers.forEach((tier, i) => {
  const tx = 65 + i * (tierW + 10);
  doc.roundedRect(tx, y, tierW, 140, 6).fillAndStroke('#F9F8F5', tier.color);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY).text(tier.name, tx + 10, y + 12, { width: tierW - 20 });
  doc.font('Helvetica-Bold').fontSize(11).fillColor(tier.color).text(tier.price, tx + 10, y + 32, { width: tierW - 20 });
  let fy = y + 54;
  tier.features.forEach(f => {
    doc.font('Helvetica').fontSize(9).fillColor('#1A2E3C').text(`✓  ${f}`, tx + 10, fy, { width: tierW - 20, lineGap: 2 });
    fy = doc.y + 4;
  });
});

y += 156;

// Section: Pilot Impact Targets
y = sectionHeader('Pilot Impact Targets (Year 1)', y + 10);

const stats = [
  ['150+', 'Professionals onboarded'],
  ['20+', 'Institutional partners'],
  ['30+', 'Pilot projects delivered'],
  ['$500K+', 'Income opportunities created'],
];

const statW = PAGE_W / 4;
stats.forEach(([num, label], i) => {
  const sx = 65 + i * statW;
  doc.font('Helvetica-Bold').fontSize(22).fillColor(GOLD).text(num, sx, y, { width: statW - 10, align: 'center' });
  doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(label, sx, doc.y + 2, { width: statW - 10, align: 'center' });
});

// ── PAGE 4: CONTACT ───────────────────────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill(NAVY);
doc.rect(0, 0, doc.page.width, 8).fill(GOLD);
doc.rect(0, doc.page.height - 8, doc.page.width, 8).fill(GOLD);

doc.font('Helvetica-Bold').fontSize(28).fillColor(WHITE)
   .text('Ready to Build With Us?', 65, 120, { align: 'center', width: PAGE_W });

doc.font('Helvetica').fontSize(14).fillColor(GOLD)
   .text('Let\'s map your pathway — whether you\'re a professional or a partner.', 65, 166, { align: 'center', width: PAGE_W });

hr(210, GOLD, 0.5);

const contacts = [
  ['Website', 'strategicpathways.co.ke'],
  ['Email', 'hello@strategicpathways.co.ke'],
  ['Location', 'Nairobi, Kenya · Remote across counties'],
  ['Response Time', 'We respond within 2 business days'],
];

let cy = 240;
contacts.forEach(([label, val]) => {
  doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD).text(label.toUpperCase(), 65, cy, { width: PAGE_W / 2 });
  doc.font('Helvetica').fontSize(11).fillColor(BEIGE).text(val, 65 + PAGE_W / 2, cy, { width: PAGE_W / 2 });
  cy += 34;
});

hr(cy + 10, GOLD, 0.3);

doc.font('Helvetica').fontSize(10).fillColor(MUTED)
   .text('© 2025 Strategic Pathways. All rights reserved. Connecting Africa\'s Global Talent with Local Impact.', 65, cy + 30, { align: 'center', width: PAGE_W });

doc.end();

doc.on('finish', () => {
  console.log(`✅ PDF generated at: ${OUTPUT_PATH}`);
  const size = fs.statSync(OUTPUT_PATH).size;
  console.log(`   File size: ${(size / 1024).toFixed(1)} KB`);
});
