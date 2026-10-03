# MC Almara Digital OS — Google Apps Script

Baseline migrasi Money Changer Digital OS dari PHP/API ke Google Apps Script + Google Sheets + Google Drive + PWA.

**Prinsip:** design existing dipertahankan sebagai UI master; browser tidak dipercaya untuk final calculation; sequence transaksi server-side memakai LockService; financial source of truth berada di Google Sheets.

## Setup
1. Buat Google Apps Script project.
2. Salin seluruh file repository.
3. Hubungkan ke Google Spreadsheet database.
4. Set Script Property `SPREADSHEET_ID` bila standalone.
5. Jalankan `installDatabase()` sekali.
6. Deploy sebagai Web App.

## Migrasi
Frontend memakai `google.script.run`, bukan `api.php`. Foundation sudah mencakup database schema, dashboard, customer service, transaction service, audit, sequence, security context, dan PWA manifest. Modul KYC/OCR, rate source, stock, payment verification, closing, accounting, compliance, regulatory, Drive Document Center, WhatsApp, dan SaaS control dilanjutkan di atas foundation ini tanpa redesign UI.