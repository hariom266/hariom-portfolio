# Hariom Chourasiya Portfolio

Personal portfolio featuring Java, full-stack and cloud projects, education, certifications, and contact information.

Live website: https://hariom-portfolio-lac.vercel.app
Original published site: https://hariom-chourasiya-portfolio.suyashchourasiya1.chatgpt.site

This folder contains the compiled static website. No framework installation or build step is required. `index.html` is at the root; assets and the resume use relative paths.

## Vercel

Use Framework Preset **Other**, leave the Build Command empty, and set Output Directory to **.**.

For automatic deployments, connect `hariom266/hariom-portfolio` under Vercel Project Settings > Git and use `main` as the production branch. Every subsequent push to main will deploy the updated static files.

To use a custom domain, open Project Settings > Domains, add the domain, and apply the exact DNS records Vercel provides at your domain registrar.

## AWS certificate flip cards

Edit `assets/certifications.js`: the `certifications` array controls the AWS card names, issuers, optional dates, descriptions, image paths and optional credential URLs. Add one object and one image to create another AWS card. Other certifications retain their existing presentation.

The following SVG files are clearly labeled placeholders, not credentials:
- `assets/certificates/aws-cloud-practitioner.svg`
- `assets/certificates/aws-ai-practitioner.svg`
- `assets/certificates/aws-developer-associate.svg`

Replace them with real certificate images. For PNG/JPG files, use matching base names (for example `aws-cloud-practitioner.png`) and change the corresponding `image` value in `assets/certifications.js`. Do not just rename a PNG to `.svg`.

Cards support mouse hover, click/tap, Enter and Space. Full-size links open an accessible native dialog; Escape, Close, or clicking outside closes it. Reduced motion uses a fade. The certificate grid uses 3/2/1 columns at desktop/tablet/mobile sizes.
