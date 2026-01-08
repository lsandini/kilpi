# Kilpi - Interactive Decision Support Tool for Thyroid Cancer

An interactive web-based decision support tool for papillary and follicular thyroid cancer management, based on Finnish clinical guidelines.

## About

This is an alternative interactive format of the Duodecim clinical guideline article:

**Papillaarinen ja follikulaarinen kilpirauhasen syöpä - Hoitosuositukset ja hoito-ohjeet**

Published: 22.4.2025 · Duodecim (Article ID: hsu00033)

## Features

- Collapsible navigation with expand/collapse all button
- 17 interactive decision support tools marked with a star in the navigation
- Risk stratification calculators
- Ultrasound malignancy risk assessment (EU-TIRADS)
- FNA indication calculator
- Bethesda classification management
- Surgical planning decision support
- TNM staging calculator
- Radioiodine therapy indications
- Response assessment tools
- TSH target management
- Recurrent disease management
- Systemic therapy indications
- Pregnancy management guidelines
- Complete literature references (86 sources)

## Sections

| Section | Title | Interactive Tools |
|---------|-------|-------------------|
| 1 | Johdanto | - |
| 2 | Kyhmyn arviointi | 2.2 Ultraääni, 2.3 FNA, 2.4 Bethesda, 2.5 Sattumalöydökset |
| 3 | Kirurginen hoito | 3.1 Leikkaussuunnittelu, 3.4 Kalsiumin hallinta |
| 4 | Patologia | 4.2 TNM-luokitus |
| 5 | Radiojodihoito | 5.1 Riskiluokittelu |
| 6 | Vastearvio & Seuranta | 6.1 Vastearviointi, 6.3 TSH-tavoitteet |
| 7 | Uusiutunut tauti | 7.1 Uusintaleikkaukset, 7.2 RAI uusinta, 7.3 Sädehoito, 7.4 Systeeminen hoito |
| 8 | Erityisaiheet | 8.1 Geneettinen alttius, 8.2 Raskaus, 8.3 Tyreoglobuliini |
| 9 | Lähteet | 9.1 Alkuperäisartikkeli, 9.2 Kirjallisuusviitteet |

## Files

- `index.html` - Main application (requires index.css and index.js)
- `index.css` - Stylesheet
- `index.js` - JavaScript functionality
- `index-interactive.html` - Self-contained single-file version (CSS and JS embedded)
- `sources/` - Original source documents (PDF and Markdown)

## Usage

**Option 1:** Open `index.html` in a web browser. Requires `index.css` and `index.js` in the same directory.

**Option 2:** Open `index-interactive.html` for a single self-contained file with no external dependencies.

No server or build process required.

## Disclaimer

This is a decision support tool intended to assist clinical decision-making. It does not replace physician judgment or individual patient assessment. All clinical decisions should be made by qualified healthcare professionals.

## Source

Content based on Duodecim Käypä hoito guidelines.

© 2025 Kustannus Oy Duodecim
