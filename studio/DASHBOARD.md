# Fatma's Journey — Sanity Studio dashboard maintenance

The Studio is self-hosted at https://fatma-s-journey.vercel.app/ and the Sanity project ID is `q3zqgei4`, dataset `production`.

## Sanity Dashboard / Content Agent warning

The old Studio dependency `sanity@^4.10.0` is incompatible with Content Agent. The project now specifies `sanity@^6.23.0`, `react@^19.2.2`, and Node >=22.12. See Sanity's upgrade docs to verify compatibility.

**The registration step cannot be done by GitHub or Vercel deployment alone.** For Dashboard and Content Agent to understand this self-hosted Studio schema, an organization member who has Sanity deployment permissions must register the Studio and schema after the new version is live:

```bash
cd studio
npm install
npx sanity login
npm run register:dashboard
```

The script invokes:
`sanity deploy --external --url https://fatma-s-journey.vercel.app`

Re-run `npm run register:dashboard` after future schema updates. The command writes the manifest/schema to Sanity's platform; it does not reupload or delete any content or media assets.

If the terminal is unavailable, an authorized CI workflow can run the same command using a Sanity token stored as a secret. Never commit or paste a token in a repository or chat. Then open the Sanity Dashboard, visit this Studio once, and verify Content Agent functionality. This action may be subject to the Sanity plan and user's permissions.

## Editing workflow

1. Go to **ابدئي هنا** to see a six-step guide.
2. Add from the relevant department, or open **كل أعمالك — بحث وتعديل** for existing works.
3. File field = the actual PDF/video/image/audio opened by site visitors.
4. **صورة غلاف الكارت الخارجي** = OPTIONAL independent cover for the portfolio card. Does not modify the video or its playback poster. Legacy cover fields remain readable so no preexisting covers are lost.
5. Correct red validation errors before using **نشر على الموقع**. Informational warnings do not block publication.
6. **إخفاء العمل** is reversible and keeps files intact. Deleting a document is a separate action with native Sanity confirmation.
7. Migration and audit tools are under **أدوات متقدمة**. They are not needed for ordinary uploads.

## Verification checklist

- Studio home, list, editor, upload, publish, and delete confirmation work on a draft test project.
- The English/Arabic title and summary save and publish correctly.
- PDF first-page previews work without a separate cover.
- A new card cover appears centered on Work/Home while the video playback remains unchanged.
- The site uses published data, not drafts.
- Dashboard Content Agent warning is gone **after** registration, with suitable user access.
