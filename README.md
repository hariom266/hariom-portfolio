# Hariom Chourasiya Portfolio

Personal portfolio featuring Java, full-stack and cloud projects, education, certifications, and contact information.

Live website: https://hariom-portfolio-lac.vercel.app
Original published site: https://hariom-chourasiya-portfolio.suyashchourasiya1.chatgpt.site

This folder contains the compiled static website. No framework installation or build step is required. `index.html` is at the root; assets and the resume use relative paths.

## Vercel

Use Framework Preset **Other**, leave the Build Command empty, and set Output Directory to **.**.

For automatic deployments, connect `hariom266/hariom-portfolio` under Vercel Project Settings > Git and use `main` as the production branch. Every subsequent push to main will deploy the updated static files.

To use a custom domain, open Project Settings > Domains, add the domain, and apply the exact DNS records Vercel provides at your domain registrar.

## Certificate flip cards

Edit `assets/certifications-data.js`: the `certifications` array controls all card names, issuers, optional dates, descriptions, image paths and optional credential URLs. Add one object and one image to create another card. All certifications support the flip and lightbox.

The following SVG files are clearly labeled placeholders, not credentials:
- `assets/certificates/aws-cloud-practitioner.svg`
- `assets/certificates/aws-ai-practitioner.svg`
- `assets/certificates/aws-developer-associate.svg`

Replace them with real certificate images. For PNG/JPG files, use matching base names (for example `aws-cloud-practitioner.png`) and change the corresponding `image` value in `assets/certifications-data.js`. Do not just rename a PNG to `.svg`.

Cards support mouse hover, click/tap, Enter and Space. Full-size links open an accessible native dialog; Escape, Close, or clicking outside closes it. Reduced motion uses a fade. The certificate grid uses 3/2/1 columns at desktop/tablet/mobile sizes.

## GitHub-backed certificate upload

Open https://hariom-portfolio-lac.vercel.app/admin/upload (not linked in the navigation).

1. On first visit, set a password for that browser. This stores a salted PBKDF2 hash in localStorage. The lock is a convenience screen, not site-wide authentication or bank-grade security: anyone can bypass it or set their own local lock. The GitHub token is the actual publishing authority. Clear site storage if you forget the browser password.
2. Generate a fine-grained GitHub token for only `hariom266/hariom-portfolio`, with **Contents: Read and write**, and a short expiry. Paste it in the password-style token field, never in source code or chat. Repository rules may require a pull request and reject direct commits.
3. Tokens stay in memory by default. Remember token is opt-in and stores the token only in browser localStorage. Same-origin scripts can read localStorage; avoid remembering tokens on shared machines. Forget saved token removes it; revoke it on GitHub if compromised.
4. Choose an existing certificate to replace its placeholder, or add a new certification. Enter the name, issuer and optional date, select JPG/PNG/WebP up to 5 MiB, and check the preview. File signatures and image decoding are validated; large images resize to 2400 pixels maximum and compress to WebP.
5. Upload & publish creates the image and data update in one Git commit on main. A concurrent push is never forcibly overwritten; reload and retry on conflict. Existing image files remain available for older deployments. Images get unique kebab-case filenames to avoid collisions and stale caches.
6. The page links to the commit, production site and Vercel dashboard. It checks production for the new image path for up to two minutes. A successful GitHub commit does not guarantee deployment success; inspect Vercel if pending. Do not upload repeatedly while a deployment is pending.

The data module is a JSON array export, parsed without eval. Preserve its format for the uploader. This flow uses GitHub Git blobs, trees, commits and a non-forced reference update: https://docs.github.com/en/rest/git/trees. No Blob account or additional paid storage service is needed. Existing GitHub/Vercel quotas still apply. Before local edits or manual deployments after an admin upload, run `git pull --ff-only origin main` to avoid deploying stale data.

Validation: `node --test tests/upload.test.mjs` covers Unicode data, replacement/addition, image signatures, atomic commit requests, concurrent updates and expired-token failures using mocked GitHub responses. Live upload requires the owner’s token.
