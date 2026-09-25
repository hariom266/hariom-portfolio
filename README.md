# Hariom Chourasiya Portfolio

Personal portfolio featuring Java, full-stack and cloud projects, education, certifications, and contact information.

Live website: https://hariom-portfolio-lac.vercel.app
Original published site: https://hariom-chourasiya-portfolio.suyashchourasiya1.chatgpt.site

This folder contains the compiled static website. No framework installation or build step is required. `index.html` is at the root; assets and the resume use relative paths.

## Vercel

Use Framework Preset **Other**, leave the Build Command empty, and set Output Directory to **.**.

For automatic deployments, connect `hariom266/hariom-portfolio` under Vercel Project Settings > Git and use `main` as the production branch. Every subsequent push to main will deploy the updated static files.

To use a custom domain, open Project Settings > Domains, add the domain, and apply the exact DNS records Vercel provides at your domain registrar.

## Original certificate support

The static site uses assets/certifications-data.js and assets/certifications.js for all certification cards. The original React/Vite development project lives separately in ../portfolio; do not overwrite this static checkout with that older build.

The AWS Cloud Practitioner PDF has been supplied and added unchanged. Four old SVG placeholders have been removed. Existing certificate labels are retained from the portfolio, but dates, credential IDs, verification URLs, categories and file paths remain blank until verified against the real files.

Place original PDF/JPG/JPEG/PNG/WebP files in assets/certificates/. See assets/certificates/README.md for setup. Update the matching data object's file path and copy only real details. Images use the actual original as their thumbnail and open in an accessible lightbox with metadata, full-size, download and optional verification links. PDFs open directly in a new tab; the PDF label is not a fabricated certificate preview. Available certificates retain hover/tap/keyboard flips. Missing files have no misleading view/download button.

## GitHub-backed uploader

/admin/upload is not linked from the nav. Its browser-local password lock is a convenience, not server authentication. The GitHub token authorizes publication. Use a fine-grained token for only hariom266/hariom-portfolio with Contents: Read and write. Tokens remain in memory unless Remember token is selected; Forget saved token clears localStorage. Never commit tokens or paste them in chat.

The uploader accepts original PDF/JPG/PNG/WebP up to 5 MiB and preserves bytes without resizing or conversion. Optional issuer, date, credential ID, category and verification URL may be left blank. GitHub receives the file and data in one commit, with a non-forced main update to avoid overwriting concurrent changes. Vercel Git integration must be connected for automatic publishing. Push this implementation to main before using the uploader. Larger original files can be added with Git directly.

## Validation

Run npm install, npm run build and npm test. There are no dependencies. This is already a compiled static export: build validates JS syntax, relative imports, referenced assets and all nonempty certificate paths/types rather than rebundling the older React project. Original-file browser verification remains pending until real files are supplied.
