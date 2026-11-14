# Parcel Studio

React JSX, Tailwind CSS, Motion, Lucide icons, html2canvas, jsPDF, and Firebase.

Run `npm install` then `npm run dev`. Build with `npm run build`.

Each A4 page has two 148.5 mm labels. Add copies the previous sender into a new shipment. Logo uploads stay in memory and repeat across labels. Order numbers appear below the receiver. Empty notes and inactive orders are omitted. Each page prints or downloads individually. PDF filenames use all active order numbers on that page and the device's local date (DD-MM-YYYY); a page number is used when there are no orders. Unsafe filename characters are replaced with hyphens.

PDFs embed a high-resolution image so Thai text and uploaded logos match the preview. Fonts are bundled. Unsaved edits are held in memory; refreshing clears them. Print at 100% on A4 with browser headers/footers disabled.

The top-right Save button stores a full batch in Firebase Realtime Database, and Saved shipments lists saved batches for reopening. Your supplied Firebase web configuration is included in src/firebase-config.js. Read FIREBASE_SETUP.md to enable authentication and publish the database rules. The app works without Firebase for editing and PDF export; cloud saving requires sign-in and published database rules.

Source map: src/main.jsx contains the editor and PDF generation; src/style.css contains the layout and print styles; src/SavedShipments.jsx contains the saved library and login UI; src/database.js contains Firebase calls. database.rules.json provides per-user access rules and .env.example lists the required web configuration. The supplied Firebase web configuration is included; no account passwords or service-account credentials are included.


