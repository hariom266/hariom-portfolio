# Original certificates

Place your real PDF, JPG, JPEG, PNG or WebP files here. Keep the original contents and resolution. Use simple kebab-case filenames without spaces.

One real certificate is included: aws-cloud-practitioner.pdf, with a thumbnail rendered from its first page. The portfolio does not display fabricated previews.

Edit the matching object in `../certifications-data.js`: set `file` to `./assets/certificates/<your-real-filename>`. Copy the exact `name`, `issuer`, `date`, `credentialId`, `credentialUrl` and `category` where known; leave unknown values empty. Do not infer dates or IDs from the resume.

Images use their actual file as the thumbnail and open in a lightbox. PDFs open directly in a new tab; the card shows a PDF document label rather than an invented thumbnail. All available files have open and download links.

Alternatively, use `/admin/upload` after the updated uploader is deployed and committed to main. It preserves the original file bytes and accepts files up to 5 MiB. Larger originals can be added directly to this folder with Git without downsampling them.


Certificate viewing policy: the Cloud Practitioner and AI Practitioner certificates have real previews rendered from their unchanged PDFs. View Certificate opens these previews in the lightbox. Certificate download and open-original buttons were removed at the owner’s request. Public images/PDF URLs, GitHub files, browser saving and screenshots cannot be made copy-proof.
