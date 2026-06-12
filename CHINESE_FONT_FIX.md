# Chinese Font Support for PDF - Fix for Garbled Text

## Problem
jsPDF doesn't support Chinese characters by default, causing garbled text (乱码) in the Terms & Conditions section.

## Solution Options

### Option 1: Use English Translation Only (CURRENT - TEMPORARY)
The Chinese text has been replaced with an English translation in brackets and italic font:
```
[Chinese translation: Participants must have valid passport and visa for smooth travel.
Visas and vaccinations must be arranged in advance. All costs are non-refundable if visa
is rejected or entry is denied. Military personnel and National Servicemen must arrange
their own exit permits and bear all responsibilities.]
```

**Pros**: Works immediately, no additional setup
**Cons**: Not authentic, doesn't match original document

### Option 2: Add Chinese Font Support (RECOMMENDED)

To properly display Chinese characters, you need to:

#### Step 1: Get a Chinese Font File
Download a Chinese font that's free to use, such as:
- **Noto Sans SC** (Google Fonts): https://fonts.google.com/noto/specimen/Noto+Sans+SC
- **Source Han Sans**: https://github.com/adobe-fonts/source-han-sans

Download the `.ttf` file (TrueType Font).

#### Step 2: Convert Font to Base64 or Include in Project
Place the font file in `/public/fonts/` directory:
```
/public/fonts/NotoSansSC-Regular.ttf
```

#### Step 3: Install jsPDF Font Converter
```bash
npm install jspdf-customfonts --save
# or use online converter
# Visit: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
```

#### Step 4: Update pdfGenerator.ts

Add font loading at the top of the file:
```typescript
import { jsPDF } from 'jspdf'
// Add custom font
const loadChineseFont = async () => {
  const response = await fetch('/fonts/NotoSansSC-Regular.ttf')
  const fontData = await response.arrayBuffer()
  return fontData
}
```

Then in the Terms & Conditions section:
```typescript
// Load Chinese font
const chineseFont = await loadChineseFont()
doc.addFileToVFS('NotoSansSC-Regular.ttf', chineseFont)
doc.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal')

// Use Chinese font
doc.setFont('NotoSansSC')
doc.setFontSize(8)

const chineseText = [
  '参加者必须持有效护照及签证以便行程顺利进行。有关游览证需要呈现于大陆以上食宿处。所有签证',
  '及免疫针必须提前办好或咨询。所有被拒绝签证者或在入境处被遇人境拒绝者，所有之费用将',
  '不受索回。凡从军人士、候备役人士及国民服务者须自行安排是否能准予出境，所有此预备费将',
  '自行负责经理，所有果公司将不负任何责任或赔偿。'
]

chineseText.forEach(line => {
  doc.text(line, 15, tcY)
  tcY += 4
})

// Switch back to English font
doc.setFont('helvetica', 'normal')
```

### Option 3: Use Image Instead (EASIEST)

Convert the Terms & Conditions page to an image and embed it:

#### Step 1: Create T&C as PNG/JPG
Create a high-quality image of the Terms & Conditions page and save it to:
```
/public/images/terms-and-conditions.jpg
```

#### Step 2: Update Code
```typescript
if (data.includeTerms) {
  doc.addPage()
  
  // Load image
  const tcImage = await loadImageAsBase64('/images/terms-and-conditions.jpg')
  
  if (tcImage) {
    // Add full-page image (A4 size: 210 x 297 mm)
    doc.addImage(tcImage, 'JPEG', 0, 0, 210, 297)
  }
}
```

**Pros**: 
- Simple to implement
- Perfect rendering
- No font issues

**Cons**: 
- Fixed content (can't be dynamically changed)
- Larger file size

### Option 4: Upgrade jsPDF and Use Unicode

Upgrade to the latest jsPDF version which has better Unicode support:

```bash
npm install jspdf@latest --save
```

Then use Unicode encoding:
```typescript
doc.setFont('courier') // Courier has better Unicode support
doc.text(chineseText, 15, tcY)
```

**Note**: This may still not work perfectly with complex Chinese characters.

## Recommended Approach

**For Production**: Use **Option 3 (Image)** - it's the most reliable and looks exactly like your original document.

**For Full Control**: Use **Option 2 (Custom Font)** - allows dynamic content and perfect rendering.

## Current Status

✅ Terms & Conditions structure implemented
⚠️ Chinese text replaced with English translation (temporary)
🔧 Need to implement Option 2 or 3 for proper Chinese display

## Implementation Priority

1. **Quick Fix**: Keep current English translation (already done)
2. **Best Solution**: Create T&C image and use Option 3
3. **Advanced**: Add Chinese font support using Option 2

Let me know which approach you'd like to implement!
