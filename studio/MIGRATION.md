# Fatma's Journey — 260-item Sanity migration

This is an owner-operated, idempotent migration in the existing authenticated Sanity Studio.

## Source and coverage
- Source: `data/portfolio-catalog.json` (260 Google Drive entries).
- Snapshot used by the tool: `studio/legacy-catalog.js`, from the same 260 entries.
- 130 entries already have known `sanityId` values. The other 130 use stable IDs `drive-<driveFileId>` to preserve existing public work URLs.
- The import checks actual published/raw Sanity documents; the presence of an ID in the catalog is not proof the document exists.

## Run (Studio)
1. Open `https://fatma-s-journey.vercel.app/` while signed in with Sanity Editor permissions.
2. Open **نقل 260 عمل إلى Sanity** in the sidebar.
3. Verify **existing** / **missing** counts. Click the import action once. The operation uses `createIfNotExists` in small transactions; existing works are never replaced. It adds source provenance to linked records only if missing.
4. Recheck that 260 work records are in Sanity. At this stage original media may still be on Google Drive.
5. For actual binary migration, select all original files or a synced/downloaded Google Drive folder using the second section. Review auto-matches and select the correct project for ambiguous filenames. Then start the asset upload. This uses the currently signed-in Sanity user; no API token is embedded.
6. Re-run as needed after interruptions. Already uploaded assets are skipped.

## Safety and behavior
- No `delete` or `createOrReplace` mutations are used.
- The `work.media` field points to uploaded PDF/video/audio/document assets; image projects use `work.cover`.
- Until media is uploaded, website projects continue to use the original Google Drive preview URL via `sourceDriveId`/catalog fallback. The website's assembler de-duplicates imported records by ID and Drive source ID.
- Missing Arabic/English translations are **not fabricated** during import. They are flagged by the **فحص المحتوى والتعريب** dashboard.
- File upload may use substantial Sanity storage and depends on the owner's account permission, per-file size, and internet connection.
- If the same filename maps to multiple projects, the tool does not assign it automatically.
- This tool does not directly read protected Google Drive data or transfer binary content in the background. File selection and approval in Sanity Studio are required.

## Verification
- Synthetic test using all 260 catalog records: 260 unique document IDs and 260 assembled website projects, no duplicates.
- Source catalog is preserved and not deleted.
