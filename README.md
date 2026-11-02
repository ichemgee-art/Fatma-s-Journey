# Fatma's Journey — Creative Portfolio + Sanity CMS

A responsive portfolio in warm beige, soft purple and deep navy. Includes Home, Work, About, Contact and the six portfolio areas: Content Plans, Voice Over, Dubbing, AI Content, Reels, Photography.

## Live deployment

- Vercel project: **fatma-journey**
- Public domain configured in Vercel: https://fatma-journey.vercel.app
- GitHub: https://github.com/ichemgee-art/Fatma-s-Journey
- Sanity project ID (existing): **q3zqgei4**
- Sanity dataset used by the integration: **production** (confirm in Sanity Manage; override with SANITY_DATASET if it is different).

This repo is the source of truth. Vercel builds automatically from commits to main.

## How project content flows

1. An editor creates and **publishes** a portfolio project in Sanity Studio.
2. Vercel's server-side endpoint GET /api/projects fetches **published** Sanity project documents.
3. The website renders project cards and category filters and opens their photo, video, and audio galleries.
4. Images/videos uploaded to Sanity but not assigned to a project appear in the **More photos & videos** archive.
5. The endpoint also reads site settings (hero photo, headline, About, contact email) when published.

Nothing needs to be committed to GitHub for ordinary project additions.

## Studio management

The /studio/ folder contains the source for Fatma's authenticated Sanity Studio.
It is **not yet a hosted Studio** just because the source exists in GitHub.

You can run or deploy Studio using Node 20+ and an account with permission on the existing Sanity project:

    cd studio
    npm install
    npx sanity login
    npm run dev

Open the local Studio URL shown by the CLI. To deploy an authenticated cloud Studio:

    npm run deploy

The Sanity CLI will prompt to select a hosted studio hostname, e.g. fatma-journey.sanity.studio if available.
Do not assume that suggested URL exists until deployment confirms it.

### Deploy the Studio from your browser (no CLI needed)

1. In Vercel, click **Add New → Project**, import the same repository **ichemgee-art/Fatma-s-Journey** again.
2. Name this second Vercel project **fatma-studio**. Do not replace the existing fatma-journey website.
3. Open **Edit Root Directory**, select **studio** (not \`./\`).
4. Keep **Application Preset: Other**. The included \`studio/vercel.json\` sets \`npm run build\` and the \`dist\` output directory.
5. Click **Deploy** and confirm it is READY. Copy its **actual** Vercel domain; do not assume the example domain below exists.
6. In Sanity Manage → project q3zqgei4 → **API → CORS Origins**, add **https://<your-studio-domain>**, with **Allow credentials** enabled (Studio requires authentication).
7. Open that Studio domain, sign in with the account authorized on Sanity, and create/publish portfolio documents.

Keep the Studio behind Sanity authentication. If the project is private, set the server-side SANITY_READ_TOKEN in the **fatma-journey** Vercel project's environment settings, not in this Studio's frontend.

### Add a project

- In Studio, choose **Portfolio project** and click **Create**.
- Enter **Title**, **Category** (one of six) and **Short description**.
- Upload the cover image.
- In **All photos, videos and media**, add images, uploaded video/audio files, or YouTube/Vimeo URLs.
- Optionally set Client, Role, Year, Featured and Order.
- Click **Publish**. Then open the portfolio's Work section. New content usually appears once API caching expires (up to a couple of minutes).

The Studio also includes a **Project (compatible)** document type for existing documents of type project.

### Media archive and privacy

Any published Sanity media asset not attached to a portfolio project may appear in the website's media archive.
Upload **only media approved for public portfolio use** into this project. If uploads include confidential work, don't make the dataset public or expose those assets; use a separate private dataset/project or remove private assets.

## Vercel setup

The API uses:
- SANITY_PROJECT_ID (default q3zqgei4)
- SANITY_DATASET (default production)
- SANITY_READ_TOKEN (optional for public datasets, **required for private datasets**)

Keep SANITY_READ_TOKEN exclusively as a **server-side Vercel environment secret**. Do not put it into index.html, GitHub or browser scripts. Create a limited read-only token through Sanity Manage if needed. Never copy an admin token into code.

The frontend calls the same-origin /api/projects, so a separate browser CORS origin is **not required** for this read path. Studio itself may require its own allowed CORS origin when hosted.

For the API to show current projects, the selected dataset must exist, contain correctly published portfolio documents or public assets, and be readable by the API.

## Implementation notes

- Static index.html plus serverless api/projects.js (Vercel / Other).
- Homepage hero image is illustrative until an approved image is added in Sanity settings.
- No fake client projects, video clips or contact addresses are seeded.
- Media gallery supports Sanity image assets, file video uploads, hosted YouTube/Vimeo videos, and audio.
- All fetched URLs are required to use HTTPS and text is displayed safely without interpreting HTML.

## Release checklist

- [ ] Confirm Sanity dataset name and visibility in Sanity Manage.
- [ ] Deploy Sanity Studio with correct CORS origins.
- [ ] Add/publish Fatma's actual projects, images, videos and approved hero image.
- [ ] Add real contact details in Site Settings.
- [ ] Open /api/projects on Vercel and verify count, projects and mediaLibrary.
- [ ] Check desktop/mobile, gallery video/audio, and images with real published data.
