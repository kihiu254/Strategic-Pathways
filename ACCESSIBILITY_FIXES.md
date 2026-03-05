# Accessibility Fixes Checklist

## Issues Found in PageSpeed Insights

### Desktop (82/100)
1. ❌ Buttons without accessible names
2. ❌ Links without discernible names
3. ❌ Insufficient contrast ratios
4. ❌ Links rely on color to be distinguishable

### Mobile (90/100)
1. ❌ Insufficient contrast ratios
2. ❌ Links without discernible names
3. ❌ Heading elements not in sequential order

## Fix Instructions

### 1. Find All Icon-Only Buttons

**Search Command**:
```bash
# Windows
findstr /s /i "<button" src\components\*.tsx src\sections\*.tsx

# Look for buttons with only icons (no text)
```

**Fix Pattern**:
```tsx
// Before
<button onClick={handleClick}>
  <XIcon />
</button>

// After
<button onClick={handleClick} aria-label="Close dialog">
  <XIcon />
</button>
```

**Common Cases**:
- Close buttons: `aria-label="Close"`
- Menu toggles: `aria-label="Open menu"`
- Search buttons: `aria-label="Search"`
- Social media: `aria-label="Follow us on Twitter"`

### 2. Find All Icon-Only Links

**Search Command**:
```bash
findstr /s /i "<a href" src\components\*.tsx src\sections\*.tsx
```

**Fix Pattern**:
```tsx
// Before
<a href="/profile">
  <UserIcon />
</a>

// After
<a href="/profile" aria-label="View profile">
  <UserIcon />
</a>
```

### 3. Fix Contrast Ratios

**WCAG AA Requirements**:
- Normal text (< 18pt): 4.5:1 contrast ratio
- Large text (≥ 18pt or 14pt bold): 3:1 contrast ratio

**Common Problem Colors**:
```css
/* Check these in your CSS/Tailwind */
--sp-accent: #C89F5E; /* Gold - check against backgrounds */
--text-secondary: /* Often too light */
--border-color: /* Often too subtle */
```

**Tools to Check**:
- Chrome DevTools: Inspect element → Accessibility pane
- Online: https://webaim.org/resources/contrastchecker/

**Fix Examples**:
```css
/* Before - Insufficient contrast */
.text-gray-400 { color: #9CA3AF; } /* 2.8:1 on white */

/* After - Sufficient contrast */
.text-gray-600 { color: #4B5563; } /* 7.0:1 on white */
```

### 4. Fix Heading Order

**Rule**: Headings must be in sequential order (h1 → h2 → h3)

**Search Command**:
```bash
findstr /s /i "<h[1-6]" src\sections\*.tsx
```

**Common Issues**:
```tsx
// ❌ Bad - Skips h2
<h1>Main Title</h1>
<h3>Subsection</h3>

// ✅ Good
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

**Fix Strategy**:
- Use CSS for visual styling, not heading levels
- Keep semantic structure correct

```tsx
// Visual h3 that's semantically h2
<h2 className="text-lg font-medium">Looks like h3</h2>
```

### 5. Links That Rely on Color

**Issue**: Links only distinguished by color (no underline/icon)

**Fix**:
```css
/* Add underline or other visual indicator */
a {
  text-decoration: underline;
  text-decoration-color: rgba(200, 159, 94, 0.5);
  text-underline-offset: 2px;
}

/* Or add hover state with more than color */
a:hover {
  text-decoration-thickness: 2px;
  font-weight: 500;
}
```

## Priority Files to Check

Based on typical issues, check these files first:

1. **Navigation.tsx** - Menu buttons, links
2. **Footer.tsx** - Social media links
3. **HeroSection.tsx** - CTA buttons
4. **ContactSection.tsx** - Form buttons
5. **OpportunitiesSection.tsx** - Cards and links
6. **All modal/dialog components** - Close buttons

## Automated Checks

**Install axe DevTools**:
```bash
# Chrome Extension
# https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd
```

**Run in Browser**:
1. Open page
2. Open DevTools (F12)
3. Go to "axe DevTools" tab
4. Click "Scan ALL of my page"
5. Fix issues one by one

## Testing Checklist

- [ ] All buttons have accessible names
- [ ] All links have discernible names
- [ ] All text meets contrast requirements (4.5:1 minimum)
- [ ] Headings are in sequential order
- [ ] Links are distinguishable without color alone
- [ ] Forms have proper labels
- [ ] Images have alt text
- [ ] Focus indicators are visible

## Quick Test

**Keyboard Navigation**:
1. Press Tab to navigate
2. Ensure all interactive elements are reachable
3. Ensure focus indicator is visible
4. Press Enter/Space to activate

**Screen Reader Test** (Windows):
1. Enable Narrator (Win + Ctrl + Enter)
2. Navigate through page
3. Ensure all content is announced properly

## After Fixes

Run PageSpeed Insights again:
```
https://pagespeed.web.dev/
```

Expected scores:
- Desktop Accessibility: 82 → 100
- Mobile Accessibility: 90 → 100
