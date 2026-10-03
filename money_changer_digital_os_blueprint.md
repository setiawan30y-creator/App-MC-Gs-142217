# BLUEPRINT --- MONEY CHANGER DIGITAL OS

## SaaS Multi-Tenant • Web • Flutter Android/iOS • Bahasa Indonesia

> Dokumen master blueprint. Seluruh fitur yang sudah disepakati
> dikonsolidasikan di sini. Prinsip UI: padat seperti buku tulis/Excel,
> cepat untuk Teller, mewah/elegan, responsif, aman, audit-ready.

------------------------------------------------------------------------

# 1. VISI & KONSEP

Money Changer Digital OS adalah platform operasional money changer
berbasis SaaS multi-tenant yang mengintegrasikan:

-   Customer & KYC/OCR
-   Transaksi jual/beli valuta
-   Multi-transaksi 2--5+ nasabah secara bersamaan
-   Kurs referensi dari API/scraping sumber eksternal yang sah
-   Spread nominal otomatis
-   Pembayaran Cash, Transfer, Split Cash + Transfer
-   Kas, rekening, stok valuta, vault
-   Closing harian Rp dan seluruh valuta
-   Accounting
-   Regulatory Threshold
-   AML/APU-PPT
-   LKPBU, SIPESAT, goAML dan pelaporan terkait
-   Document Center
-   Currency Reference Gallery
-   Numismatic Center
-   Internal Chat
-   Notification Engine
-   Customer Waiting List
-   Employee Shift Management
-   Admin/Teller/Supervisor/Management Workspace
-   WhatsApp Gateway
-   Weather & Location Widget
-   SaaS billing dan tenant management

Bahasa utama sistem: **Bahasa Indonesia**. Bahasa tambahan: English.

------------------------------------------------------------------------

# 2. ARSITEKTUR SAAS

``` text
ALMARA PLATFORM / OS
        │
        ▼
SAAS CONTROL CENTER
        │
 ┌──────┼────────┬────────┐
 ▼      ▼        ▼        ▼
Tenant A Tenant B Tenant C ...
 │
 ├── Cabang
 ├── User
 ├── Role
 ├── Customer
 ├── Transaksi
 ├── KYC
 ├── Kas/Bank
 ├── Stok Valuta
 ├── Accounting
 ├── Compliance
 ├── Dokumen
 └── Audit
```

## SaaS Features

-   Multi-tenant
-   Tenant registration
-   Paket/subscription
-   Trial
-   Upgrade/downgrade
-   Feature toggle
-   Add-on
-   User limit
-   Branch limit
-   Storage limit
-   Transaction limit
-   API limit
-   Tenant branding
-   Logo
-   Theme
-   Custom domain
-   Language
-   Tenant configuration
-   Tenant suspend/activate
-   Invoice subscription
-   Payment subscription

## Data Isolation

Setiap data utama minimal memiliki:

``` text
tenant_id
branch_id
created_by
updated_by
```

ID database menggunakan UUID/ULID bila sesuai; nomor bisnis menggunakan
sequence yang mudah dibaca manusia.

------------------------------------------------------------------------

# 3. ROLE, AKUN & WORKSPACE

## Workspace

``` text
ADMIN PANEL
TELLER WORKSPACE
SUPERVISOR WORKSPACE
MANAGEMENT WORKSPACE
KYC WORKSPACE
ACCOUNTING WORKSPACE
COMPLIANCE WORKSPACE
REGULATORY REPORTING
NUMISMATIC CENTER
DOCUMENT CENTER
INTERNAL CHAT
FLUTTER MOBILE
```

## Role contoh

-   Super Admin Platform
-   Tenant Owner
-   Tenant Admin
-   Branch Manager
-   Supervisor
-   Teller/Kasir
-   KYC Officer
-   Compliance Officer
-   Accounting
-   Finance
-   Auditor Read-Only
-   Staff

## Prinsip akses

``` text
Tenant → Cabang → Workspace → Role → Permission → Data Scope
```

Teller tidak melihat pengaturan Admin. Owner/Management mendapat
dashboard strategis. Workspace dibatasi sesuai tugas.

------------------------------------------------------------------------

# 4. ADMIN PANEL

``` text
ADMIN PANEL
├── Dashboard
├── Tenant
├── Cabang
├── User & Akun
├── Role & Permission
├── Approval
├── Customer
├── KYC
├── Currency
├── Kurs
├── Rate Source / Scraper
├── Payment
├── Kas & Bank
├── Stok Valuta
├── Closing
├── Accounting
├── AML / Compliance
├── Regulatory
├── Document Center
├── Numismatic
├── WhatsApp
├── Notification
├── Chat
├── Gallery Referensi Valuta
├── Kepegawaian & Shift
├── Customer Waiting List
└── Audit Trail
```

------------------------------------------------------------------------

# 5. TELLER WORKSPACE

Teller menjadi layar transaksi utama.

## Prinsip

-   Padat
-   Cepat
-   Keyboard-friendly
-   Minim perpindahan halaman
-   Fokus customer/transaksi
-   Multi transaksi aktif

## Fitur

-   Transaksi baru
-   Cari customer
-   KYC/OCR
-   Currency picker
-   Rate otomatis
-   Gallery Reference
-   Threshold check
-   Payment
-   Hold
-   Resume
-   Switch customer
-   Print
-   WhatsApp receipt
-   Transaction history

------------------------------------------------------------------------

# 6. MULTI TRANSACTION WORKSPACE

Teller dapat menangani 2--5+ nasabah secara bersamaan.

``` text
┌────────┬──────────┬────────────┬──────────────┐
│ TAB    │ NO TRX   │ NASABAH    │ STATUS       │
├────────┼──────────┼────────────┼──────────────┤
│ 01     │ 000125   │ Budi       │ HITUNG       │
│ 02     │ 000126   │ Andi       │ INPUT        │
│ 03     │ 000127   │ Siti       │ KYC          │
│ 04     │ 000128   │ Rudi       │ BAYAR        │
│ 05     │ 000129   │ Deni       │ DRAF         │
└────────┴──────────┴────────────┴──────────────┘
```

## Workflow

``` text
Transaksi Baru
→ Nomor transaksi dibuat
→ Input/KYC
→ Rate Lock/Snapshot
→ Hold atau lanjut
→ Payment
→ Verifikasi
→ Confirm
→ Invoice/Receipt
→ Print
→ WhatsApp
→ Selesai
```

## Status

-   Draf
-   Berjalan
-   Menunggu
-   Ditunda/Hold
-   Siap Pembayaran
-   Menunggu Verifikasi
-   Lunas
-   Selesai
-   Dibatalkan
-   Kedaluwarsa

## Penomoran

Pisahkan:

-   Workspace Number
-   Business Transaction Number
-   Invoice Number
-   Receipt Number
-   UUID/ULID

Nomor transaksi diamankan saat transaksi dibuat. Invoice/receipt final
mengikuti status bisnis yang dikonfigurasi.

Sequence dapat dipisah berdasarkan tenant, cabang, tanggal, dan jenis
transaksi.

------------------------------------------------------------------------

# 7. CUSTOMER & CUSTOMER 360

## Customer Master

-   Profil
-   Identitas
-   Kewarganegaraan
-   Kontak
-   KYC
-   Risk profile
-   Transaction history
-   Threshold usage
-   Documents
-   AML alerts
-   Waiting List
-   Chat history

## Customer 360

``` text
CUSTOMER
├── KYC
├── Risk
├── Transaksi
├── Valuta Dibeli
├── Valuta Dijual
├── Threshold
├── AML Alert
├── Dokumen
├── Waiting List
├── Reservasi
└── Chat
```

------------------------------------------------------------------------

# 8. KYC + OCR

OCR menjadi jalur utama input data identitas.

## Alur

``` text
Camera/Upload
→ Auto Crop
→ Rotate/Enhance
→ OCR
→ Extract Data
→ Confidence
→ Auto Fill
→ Review
→ KYC Verification
→ Customer Master
```

## Dokumen

-   KTP
-   Passport
-   Dokumen pendukung

## Data OCR

-   Nomor identitas
-   Nama
-   Tempat/tanggal lahir
-   Jenis kelamin
-   Alamat
-   Kewarganegaraan
-   Field lain sesuai dokumen

## Fitur tambahan

-   Confidence score
-   Manual correction
-   Duplicate detection
-   Document expiry
-   Selfie verification/liveness bila provider tersedia
-   Face matching bila digunakan
-   OCR audit
-   Original document storage

------------------------------------------------------------------------

# 9. CURRENCY & RATE MANAGEMENT

## Currency Master

-   Mata uang
-   Negara
-   Denominasi
-   Seri
-   Status aktif/nonaktif

## Rate Architecture

``` text
Website/API Source
      ↓
Scraper/API Engine
      ↓
Normalize
      ↓
Rate Aggregator
      ↓
Reference Rate
      ↓
Spread Engine
      ↓
Internal Buy/Sell Rate
      ↓
Approval
      ↓
Publish
      ↓
Transaction Rate Lock
```

## Rate Sources

-   API source
-   Website source yang secara legal/teknis dapat digunakan
-   Primary source
-   Backup source
-   Manual source

Scraping harus mematuhi Terms of Service, robots.txt, batas akses, dan
menggunakan API resmi bila tersedia.

## Scraper Engine

-   Scheduler
-   Parser
-   Normalizer
-   Retry
-   Timeout
-   Source health
-   Last valid rate
-   Stale rate protection
-   Error log

## Rate Aggregator

Metode dapat dikonfigurasi:

-   Primary
-   Backup
-   Average
-   Median
-   Manual override

## Spread Engine

-   Buy spread
-   Sell spread
-   Nominal spread
-   Percentage spread
-   Currency-specific spread
-   Tiered spread
-   VIP rate
-   Corporate rate
-   Branch rate
-   Special rate

Contoh:

``` text
Reference USD = 16.250
Buy Spread     = -150
Sell Spread    = +200

Buy  = 16.100
Sell = 16.450
```

## Rate Lock

Setiap transaksi menyimpan snapshot:

-   Reference rate
-   Spread
-   Final rate
-   Source
-   Fetch time
-   Rate ID
-   Locked time

------------------------------------------------------------------------

# 10. CURRENCY REFERENCE GALLERY

Gallery menjadi acuan visual penerimaan valuta.

## Kategori

-   Diterima
-   Perlu pemeriksaan
-   Ditolak
-   Genuine reference
-   Damaged reference
-   Old series
-   New series
-   Withdrawn/expired series

## Data

-   Foto depan
-   Foto belakang
-   Denominasi
-   Negara
-   Seri/tahun
-   Security features
-   Acceptance rules
-   Catatan supervisor

Gallery dapat dibuka langsung dari Teller Workspace.

------------------------------------------------------------------------

# 11. TRANSACTION ENGINE

Mendukung:

-   Beli valuta
-   Jual valuta
-   Multi-currency
-   Denominasi
-   Rate lock
-   Special rate
-   Customer
-   KYC
-   Threshold
-   Payment
-   Stock posting
-   Accounting posting
-   Receipt
-   WhatsApp

Semua perubahan penting masuk audit trail.

------------------------------------------------------------------------

# 12. PAYMENT ENGINE

Metode:

``` text
CASH
TRANSFER
SPLIT CASH + TRANSFER
```

Tidak menggunakan QRIS sebagai metode split pada workflow yang dimaksud.

## Payment workflow

``` text
Payment Created
→ Verification
→ Approved
→ Posted
→ Receipt
```

Fitur:

-   Bukti transfer
-   Verifikasi
-   Payment mismatch
-   Payment pending
-   Payment failed
-   Reversal
-   Rekonsiliasi

------------------------------------------------------------------------

# 13. REGULATORY THRESHOLD ENGINE

Threshold dibuat sebagai rule yang dapat berubah berdasarkan versi
regulasi, bukan hardcode.

Untuk aturan BI yang berlaku, sistem mendukung threshold **USD 10.000
atau ekuivalen per bulan per pelaku transaksi** sesuai konteks transaksi
yang diwajibkan oleh ketentuan yang berlaku, termasuk kebutuhan
underlying sesuai rule tersebut.

## Engine

-   Threshold per customer/pelaku transaksi
-   Periode bulanan
-   Akumulasi lintas transaksi
-   Akumulasi lintas cabang
-   Multi-currency
-   USD equivalent
-   Warning
-   Threshold exceeded
-   Underlying requirement
-   Underlying documents
-   Compliance review
-   Approval/rejection
-   Rule versioning
-   Effective date
-   Rule history
-   Audit trail

## Status

-   Normal
-   Mendekati threshold
-   Hampir mencapai
-   Melewati threshold
-   Underlying Review
-   Compliance Approved
-   Compliance Rejected

Catatan: batas peringatan internal seperti 80%/90% adalah konfigurasi
internal, bukan threshold regulasi.

------------------------------------------------------------------------

# 14. KAS, REKENING BANK & STOK VALUTA

## Cash

-   Kas Teller
-   Kas Cabang
-   Vault
-   Cash In
-   Cash Out
-   Transfer antar kas
-   Serah terima

## Bank

-   Multi rekening
-   Mutasi
-   Transfer
-   Rekonsiliasi
-   Saldo

## Currency Stock

Per mata uang dan denominasi:

``` text
Opening
+ Purchase
+ Transfer In
- Sale
- Transfer Out
= Closing
```

Dapat dibedakan:

-   Available
-   Reserved
-   In transit
-   Damaged/inspection

------------------------------------------------------------------------

# 15. DAILY CLOSING & RECONCILIATION

Closing harian Rp dan seluruh valuta.

``` text
EXPECTED
   ↓
ACTUAL
   ↓
DIFFERENCE
   ↓
INVESTIGATION
   ↓
APPROVAL
```

## Yang direkonsiliasi

-   Kas Rp
-   Kas valuta
-   Rekening bank
-   Stok valuta
-   Transaksi
-   Payment
-   Transfer
-   Reserved stock

Contoh:

``` text
Expected Rp 850.000.000
Actual   Rp 849.950.000
Selisih -Rp 50.000
```

Fitur:

-   Closing teller
-   Closing cabang
-   Closing valuta
-   Closing bank
-   Tolerance
-   Approval
-   Period lock
-   Audit trail

------------------------------------------------------------------------

# 16. ACCOUNTING ENGINE

Laporan:

-   Jurnal
-   Buku besar
-   Neraca
-   Laba rugi
-   Ekuitas
-   Arus kas
-   Trial balance
-   Rekonsiliasi
-   Adjustment

Integrasi otomatis dari:

-   Transaksi
-   Payment
-   Kas
-   Bank
-   Stok
-   Closing
-   Biaya
-   Pendapatan

------------------------------------------------------------------------

# 17. AML / APU-PPT & COMPLIANCE

-   Risk scoring
-   Transaction monitoring
-   Alert
-   PEP/watchlist bila sumber tersedia
-   Suspicious pattern
-   High-risk customer
-   Underlying review
-   Investigation
-   Case status
-   Approval
-   Audit trail

------------------------------------------------------------------------

# 18. REGULATORY REPORTING

Workspace khusus:

``` text
REGULATORY REPORTING
├── LKPBU
├── SIPESAT
├── goAML
├── Watchlist/Compliance
├── Validasi
├── Generate
├── Review
├── Submit
└── Submission History
```

Format dan rule harus dapat mengikuti regulasi terbaru dan versi yang
berlaku.

------------------------------------------------------------------------

# 19. DOCUMENT & FILE MANAGEMENT CENTER

Lemari arsip digital terpusat.

## Kategori

-   Company
-   Branch
-   Customer
-   Transaction
-   Supplier
-   Employee
-   Numismatic
-   Regulatory
-   Internal

## Format

-   JPG/JPEG
-   PNG
-   WEBP
-   PDF
-   DOC/DOCX
-   XLS/XLSX
-   CSV
-   PPT/PPTX
-   TXT/RTF
-   ZIP/format lain yang diizinkan

## Fitur

-   Folder/subfolder
-   Multi upload
-   Drag & drop
-   Preview
-   Search
-   Filter
-   Tag
-   Versioning
-   Expiry date
-   Reminder
-   Access permission
-   Download history
-   Audit log
-   Recycle bin
-   Secure download

------------------------------------------------------------------------

# 20. NUMISMATIC CENTER

Ekosistem mandiri, tidak bercampur dengan transaksi money changer utama.

``` text
NUMISMATIC
├── Koin
├── Uang Lama
├── Item Satuan
├── Item Keping
├── Foto per Keping
├── Kondisi/Grade
├── Supplier
├── Purchase
├── Sale
├── Certificate
├── Storage Location
├── Valuation
└── Independent Ledger
```

Setiap item dapat memiliki:

-   kode item
-   foto
-   serial/nomor bila ada
-   denominasi
-   tahun
-   negara
-   kondisi
-   harga beli
-   harga jual
-   lokasi penyimpanan
-   supplier
-   dokumen pendukung

------------------------------------------------------------------------

# 21. CUSTOMER REQUEST & WAITING LIST

Untuk kebutuhan valuta yang belum tersedia atau customer yang ingin
dijadwalkan.

## Data request

-   Customer
-   Valuta
-   Nominal
-   Tanggal kebutuhan
-   Jam kebutuhan
-   Cabang
-   Target kurs
-   Prioritas
-   Catatan

## Status

``` text
Permintaan Baru
→ Menunggu Stok
→ Dijadwalkan
→ Stok Tersedia
→ Customer Dihubungi
→ Dikonfirmasi
→ Direservasi
→ Menjadi Transaksi
→ Selesai
```

Alternatif:

-   Ditunda
-   Dibatalkan
-   Kedaluwarsa
-   Customer tidak datang

## Stock Matching

Sistem mengecek:

-   stok cabang
-   stok cabang lain sesuai kebijakan
-   available stock
-   reserved stock
-   kebutuhan customer

## Reservation

``` text
Available
→ Reserved
→ Transaction
```

Reservasi memiliki masa berlaku dan dapat dilepas kembali ke available
stock setelah expired/cancel.

## Follow-up

-   Notifikasi internal
-   WhatsApp Gateway
-   Riwayat komunikasi
-   Buat transaksi langsung dari request

## History

Waiting List tidak dihapus setelah selesai bulan.

Riwayat menyimpan:

-   request
-   status
-   reservation
-   komunikasi
-   transaksi
-   alasan batal
-   audit trail

Data ini dapat digunakan untuk analisis kebutuhan valuta dan perencanaan
stok.

------------------------------------------------------------------------

# 22. INTERNAL CHAT & COLLABORATION

## Chat

-   Private
-   Group
-   Branch
-   Department
-   Management
-   Announcement
-   Broadcast
-   Mention
-   Reply
-   Pin
-   Bookmark
-   Search

## Contextual chat

Pesan dapat melampirkan:

-   transaksi
-   customer
-   KYC
-   AML case
-   document
-   closing
-   supplier
-   numismatic item

## Approval dari chat

Contoh:

``` text
Special Rate Request
USD 50.000
Requested Rate 16.280

[SETUJUI] [TOLAK]
```

Semua tindakan masuk audit.

------------------------------------------------------------------------

# 23. NOTIFICATION & ALERT ENGINE

Satu notification engine untuk seluruh modul.

## Jenis

### Transaksi

-   Berhasil
-   Gagal
-   Pending
-   Approval
-   Dibatalkan
-   Rate lock

### Pembayaran

-   Diterima
-   Diverifikasi
-   Mismatch
-   Gagal
-   Reversal

### KYC

-   OCR berhasil/gagal
-   Confidence rendah
-   KYC review
-   Dokumen expired
-   Face verification

### Compliance

-   AML alert
-   High risk
-   Threshold
-   Underlying
-   Investigation

### Closing

-   Reminder
-   Selisih
-   Closing approved/rejected
-   Period lock

### Rate

-   Rate updated
-   Source error
-   Scraper error
-   Backup source
-   Stale rate

### Document

-   Upload
-   Expiry
-   Approval/rejection
-   Access request

### Chat

-   Pesan
-   Mention
-   Reply
-   Approval request

### Security

-   Login baru
-   Login gagal
-   Device baru
-   Permission berubah
-   Suspicious activity

## Level

``` text
INFO
SUCCESS
WARNING
HIGH
CRITICAL
```

Critical notification dapat dibuat persistent dan memerlukan
acknowledgement sesuai role.

## Kanal

-   Toast
-   Popup
-   Push
-   Email
-   WhatsApp
-   In-app notification

------------------------------------------------------------------------

# 24. WHATSAPP GATEWAY

Otomatis mengirim:

-   Receipt transaksi
-   Bukti pembayaran
-   Status transaksi
-   Customer waiting list
-   Stok tersedia
-   Pengingat
-   Notifikasi tertentu

Status:

-   Queued
-   Sending
-   Sent
-   Delivered
-   Read
-   Failed
-   Retry

------------------------------------------------------------------------

# 25. KEPEGAWAIAN & SHIFT MANAGEMENT

## Data

-   Karyawan
-   Departemen
-   Jabatan
-   Role
-   Cabang
-   Shift

## Master Shift

-   Pagi
-   Siang
-   Sore
-   Malam
-   Full
-   Khusus

## Jadwal

-   Harian
-   Mingguan
-   Bulanan
-   Kalender

## Excel-Style Interactive

Tampilan utama:

``` text
┌───────────┬─────────┬────┬────┬────┬────┬────┬────┬─────┬────┐
│ Karyawan  │ Jabatan │ 01 │ 02 │ 03 │ 04 │ 05 │ 06 │ ... │ 31 │
├───────────┼─────────┼────┼────┼────┼────┼────┼────┼─────┼────┤
│ Yayan     │ Teller  │ P  │ P  │ L  │ P  │ P  │ P  │ ... │ P  │
│ Andi      │ Teller  │ S  │ S  │ L  │ S  │ S  │ S  │ ... │ S  │
│ Siti      │ KYC     │ P  │ P  │ P  │ L  │ P  │ S  │ ... │ P  │
└───────────┴─────────┴────┴────┴────┴────┴────┴────┴─────┴────┘
```

Fitur:

-   Sticky employee/jabatan
-   Sticky header
-   Horizontal scroll
-   Inline editing
-   Klik sel
-   Copy/paste
-   Drag/fill
-   Multi-select
-   Template
-   Undo/redo
-   Filter
-   Search
-   Print
-   PDF
-   Excel
-   CSV

## Kode

``` text
P = Pagi
S = Siang
M = Malam
F = Full
L = Libur
C = Cuti
I = Izin
O = Off
```

## Approval

``` text
Draf → Ajukan → Review → Disetujui
```

## Tukar/perubahan

-   Tukar shift
-   Pengajuan
-   Approval
-   Riwayat perubahan
-   Audit

## Shift Teller

``` text
Buka Shift
→ Saldo Awal
→ Transaksi
→ Cash Movement
→ Closing
→ Serah Terima
→ Tutup Shift
```

------------------------------------------------------------------------

# 26. SHIFT HISTORY / ARSIP BULANAN

Jadwal **tidak boleh ditimpa setiap bulan**.

Setiap bulan menjadi `period_id` sendiri.

Contoh:

``` text
Januari 2026
Februari 2026
Maret 2026
...
Agustus 2026
September 2026
```

Periode selesai:

``` text
Jadwal Bulan
→ Periode Selesai
→ Lock
→ History
→ Read Only
```

History dapat:

-   dilihat
-   dicari
-   difilter
-   dicetak
-   export PDF
-   export Excel

Jika ada koreksi jadwal lama:

``` text
Koreksi
→ Approval
→ Version
→ Audit Trail
```

Jadwal asli tidak dihapus.

## Struktur periode

``` text
schedule_periods
├── tenant_id
├── branch_id
├── year
├── month
├── status
├── locked_at
└── locked_by
```

Jadwal:

``` text
shift_schedules
├── tenant_id
├── branch_id
├── employee_id
├── period_id
├── schedule_date
├── shift_id
├── status
├── version
├── created_by
└── approved_at
```

------------------------------------------------------------------------

# 27. PENGATURAN

Pengaturan dibagi:

``` text
PLATFORM
→ TENANT
→ CABANG
→ USER
```

## Kategori

1.  Perusahaan
2.  Cabang
3.  User & Akun
4.  Role & Permission
5.  Transaksi
6.  Pembayaran
7.  Kurs
8.  Valuta
9.  Gallery
10. KYC & OCR
11. AML & Compliance
12. Regulatory
13. Kas & Bank
14. Closing
15. Accounting
16. Document Center
17. WhatsApp
18. Notifikasi
19. Chat
20. Numismatic
21. Cetak & Template
22. Bahasa & Tampilan
23. Lokasi & Cuaca
24. API & Integrasi
25. Keamanan
26. Audit & Log
27. Backup & Maintenance
28. Kepegawaian & Shift
29. Customer Waiting List

## Bahasa & Tampilan

Default:

-   Bahasa Indonesia
-   Format Rupiah
-   Format tanggal Indonesia
-   Asia/Jakarta
-   Tema terang
-   Tema gelap
-   Kepadatan tabel

Bahasa tambahan:

-   English

------------------------------------------------------------------------

# 28. LOKASI & CUACA

## Widget

-   Lokasi cabang
-   Alamat
-   Koordinat
-   Peta
-   Status cabang
-   Jam operasional
-   Cuaca
-   Suhu
-   Kelembapan
-   Angin
-   Prakiraan

## Multi-cabang

Dashboard dapat menampilkan kondisi tiap cabang.

Lokasi pengguna di Android hanya digunakan bila fitur memang memerlukan
izin lokasi.

------------------------------------------------------------------------

# 29. CETAK & EXPORT CENTER

Semua modul yang relevan mendukung:

-   Print preview
-   Print
-   PDF
-   Excel
-   CSV

Template dapat diatur:

-   Logo
-   Header
-   Footer
-   Nomor dokumen
-   Tanda tangan
-   Stempel bila diperlukan
-   Layout

------------------------------------------------------------------------

# 30. REPORTING & FINANCIAL STATEMENTS

## Operasional

-   Transaksi harian
-   Pembelian valuta
-   Penjualan valuta
-   Payment
-   Kas
-   Bank
-   Stok
-   Closing
-   Rekonsiliasi
-   Waiting List

## Keuangan

-   Jurnal
-   Buku besar
-   Neraca
-   Laba rugi
-   Ekuitas
-   Arus kas
-   Trial balance

## Compliance/Regulatory

-   LKPBU
-   SIPESAT
-   goAML
-   AML monitoring
-   Threshold
-   Underlying

------------------------------------------------------------------------

# 31. PERIOD MANAGEMENT & ARCHIVE

Untuk laporan dan data operasional yang membutuhkan periode:

``` text
Periode
→ Closing
→ Review
→ Approval
→ Lock
→ Archive
```

Data historis tidak ditimpa.

Dapat menggunakan:

-   Period ID
-   Snapshot
-   Immutable archive
-   Audit trail
-   Read-only history

Export:

-   PDF
-   Excel
-   CSV

------------------------------------------------------------------------

# 32. AUDIT TRAIL

Catat aktivitas penting:

-   Login
-   Logout
-   Create
-   Update
-   Delete/soft delete
-   Approval
-   Rejection
-   Rate change
-   Special rate
-   KYC
-   Threshold
-   Payment
-   Closing
-   Accounting adjustment
-   Document access
-   Chat approval
-   Shift change
-   Waiting List change
-   Permission change

Informasi minimal:

``` text
who
what
when
where
before
after
reason
reference_id
```

------------------------------------------------------------------------

# 33. SECURITY

-   RBAC
-   Tenant isolation
-   Branch isolation
-   MFA
-   Password policy
-   Session management
-   Device management
-   IP restriction bila dibutuhkan
-   Encryption
-   Secure file access
-   Audit logging
-   Rate-limit
-   CSRF/XSS/SQLi protection
-   API authentication
-   Secret management
-   Backup

------------------------------------------------------------------------

# 34. MOBILE FLUTTER

Backend yang sama melayani:

``` text
Laravel REST API
      ↓
/api/v1
      ↓
Flutter Android
Flutter iOS
Flutter Web bila dibutuhkan
```

## Mobile workspace

Role menentukan tampilan:

-   Teller
-   Supervisor
-   Owner
-   KYC
-   Compliance
-   Management

Fitur mobile:

-   transaksi
-   customer
-   KYC/OCR
-   approval
-   closing
-   notification
-   chat
-   waiting list
-   dashboard
-   shift
-   location/weather

------------------------------------------------------------------------

# 35. BACKEND / TECHNOLOGY STACK

Target production:

``` text
Ubuntu Server 24.04 LTS
Nginx
PHP 8.4+
Laravel 13
MySQL
Redis
Supervisor
Queue
Scheduler
SSL Let's Encrypt
Git Deployment
```

API:

``` text
/api/v1
```

Komponen:

-   Repository Pattern
-   Service Layer
-   Middleware
-   Policy
-   Role & Permission
-   Validation
-   Standard JSON response
-   Error handling
-   Logging
-   Queue
-   Notification
-   Storage
-   Localization
-   API documentation
-   OpenAPI/Swagger
-   Backup
-   Security best practices

------------------------------------------------------------------------

# 36. MODULAR DATABASE DOMAIN

Minimal domain:

``` text
tenants
branches
users
roles
permissions
customers
customer_documents
kyc_records
currencies
currency_denominations
rate_sources
rate_snapshots
rate_rules
transaction_carts
transactions
transaction_items
transaction_item_rates
transaction_item_stock_allocations
transaction_payments
transaction_payment_allocations
payment_verifications
cash_accounts
bank_accounts
currency_stocks
stock_movements
stock_reservations
closings
closing_details
journal_entries
journal_lines
aml_alerts
compliance_cases
regulatory_rules
underlying_documents
regulatory_reports
documents
document_versions
numismatic_items
numismatic_suppliers
numismatic_movements
chat_conversations
chat_messages
notifications
employees
shifts
shift_schedules
schedule_periods
schedule_changes
attendance_records
attendance_photos
attendance_corrections
attendance_approvals
geofences
customer_requests
customer_request_items
customer_reservations
audit_logs
periods
```

------------------------------------------------------------------------

# 37. ALUR TRANSAKSI UTAMA

``` text
CUSTOMER
  ↓
KYC / OCR
  ↓
CUSTOMER MASTER
  ↓
TELLER WORKSPACE
  ↓
PILIH VALUTA
  ↓
REFERENCE RATE
  ↓
SPREAD ENGINE
  ↓
INTERNAL BUY/SELL RATE
  ↓
THRESHOLD CHECK
  ↓
UNDERLYING / COMPLIANCE bila diperlukan
  ↓
RATE LOCK
  ↓
PAYMENT
  ├── Cash
  ├── Transfer
  └── Split Cash + Transfer
  ↓
VERIFY
  ↓
POST STOCK + CASH/BANK
  ↓
ACCOUNTING
  ↓
RECEIPT
  ↓
PRINT
  ↓
WHATSAPP
  ↓
AUDIT
```

------------------------------------------------------------------------

# 38. ALUR CUSTOMER TIDAK MENDAPAT STOK

``` text
Customer datang
  ↓
Kebutuhan USD 20.000
  ↓
Stok hari ini tidak cukup
  ↓
Customer Request
  ↓
Waiting List
  ↓
Stock Matching
  ↓
Stok tersedia
  ↓
Notifikasi Customer
  ↓
Reservation
  ↓
Customer datang
  ↓
Buat Transaksi
  ↓
Teller Workspace
  ↓
Transaction
```

------------------------------------------------------------------------

# 39. ALUR SHIFT TELLER

``` text
Jadwal Bulanan
  ↓
Employee Shift
  ↓
Login
  ↓
Buka Shift
  ↓
Saldo Awal
  ↓
Multi Transaction Workspace
  ↓
Cash/Bank/Stock Movement
  ↓
Closing
  ↓
Reconciliation
  ↓
Serah Terima
  ↓
Tutup Shift
```

------------------------------------------------------------------------

# 40. UI/UX DESIGN SYSTEM

## Gaya visual

-   Mewah
-   Elegan
-   Profesional
-   Padat
-   Modern
-   Tidak banyak ruang kosong
-   Terinspirasi buku tulis/ledger
-   Tabel dense
-   Fokus data

## Teller

-   Dense table
-   Keyboard-first
-   Quick action
-   Multi transaction tabs
-   Sticky header
-   Sticky customer column

## Excel-style

Dipakai khusus untuk:

-   Jadwal shift
-   Tabel operasional tertentu
-   Rekap

Fitur:

-   horizontal scroll
-   inline edit
-   copy/paste
-   drag/fill
-   multi select
-   filter
-   export

------------------------------------------------------------------------

# 41. ROADMAP IMPLEMENTASI

## Fase 1 --- Foundation

-   SaaS
-   Tenant
-   Branch
-   User
-   Role
-   Permission
-   Security
-   Audit
-   Base UI
-   Bahasa Indonesia

## Fase 2 --- Customer & KYC

-   Customer
-   OCR
-   Document
-   KYC
-   Duplicate detection
-   Risk profile

## Fase 3 --- Currency & Rate

-   Currency master
-   Rate source
-   Scraper/API
-   Aggregator
-   Spread
-   Rate lock
-   Gallery

## Fase 4 --- Teller & Transaction

-   Teller Workspace
-   Multi transaction
-   Transaction numbering
-   Payment
-   Print
-   WhatsApp

## Fase 5 --- Inventory & Closing

-   Cash
-   Bank
-   Currency stock
-   Reservation
-   Closing
-   Reconciliation

## Fase 6 --- Accounting

-   Journal
-   Ledger
-   Neraca
-   Laba rugi
-   Ekuitas
-   Cash flow

## Fase 7 --- Compliance

-   Threshold
-   Underlying
-   AML
-   Compliance case
-   Regulatory reporting

## Fase 8 --- Operations

-   Employee
-   Shift
-   Excel-style schedule
-   Shift history
-   Teller handover
-   Customer Waiting List

## Fase 9 --- Communication & Documents

-   Internal chat
-   Notification
-   Document Center
-   WhatsApp Gateway

## Fase 10 --- Numismatic

-   Koin
-   Uang lama
-   Item inventory
-   Supplier
-   Photo per item
-   Independent ledger

## Fase 11 --- Mobile

-   Flutter Android
-   Flutter iOS
-   Role-based workspace
-   OCR camera
-   Notification
-   Approval

## Fase 12 --- SaaS Enterprise

-   Subscription
-   Add-on
-   Feature toggle
-   Branding
-   Custom domain
-   Tenant billing
-   Advanced analytics

------------------------------------------------------------------------

# 42. DEFINITION OF DONE

Blueprint dianggap terimplementasi jika:

-   Data tenant terisolasi
-   Role/permission berjalan
-   Teller dapat menangani 2--5+ transaksi aktif
-   Nomor transaksi anti-duplikat
-   Rate mempunyai snapshot
-   Payment Cash/Transfer/Split berjalan
-   KYC/OCR berjalan
-   Threshold dihitung lintas transaksi/cabang sesuai rule
-   Closing Rp dan valuta dapat direkonsiliasi
-   Accounting terposting
-   Dokumen tersimpan dan diaudit
-   Waiting List terhubung stok
-   Shift Excel-style berjalan
-   History shift bulanan tidak tertimpa
-   Print/PDF/Excel tersedia
-   Notification terpusat
-   Chat internal berjalan
-   WhatsApp receipt berjalan
-   Audit trail lengkap
-   Mobile role-based berjalan
-   Backup dan recovery diuji

------------------------------------------------------------------------

# 43. PRINSIP PENTING

1.  Jangan menghapus histori operasional penting.
2.  Periode yang sudah ditutup menjadi read-only.
3.  Koreksi menggunakan adjustment/version + approval.
4.  Data antar tenant wajib terisolasi.
5.  Teller hanya melihat data yang diperlukan.
6.  Rate transaksi harus memiliki snapshot/lock.
7.  Waiting List tidak boleh hilang ketika bulan berganti.
8.  Jadwal shift setiap bulan disimpan sebagai history.
9.  Dokumen sensitif menggunakan permission dan audit.
10. Regulatory rules menggunakan versioning dan effective date.
11. Sumber kurs eksternal harus digunakan sesuai ketentuan sumber.
12. Semua transaksi finansial memiliki audit trail.
13. Bahasa default seluruh UI adalah Bahasa Indonesia.
14. Semua modul dirancang agar dapat digunakan melalui Web dan Flutter.
15. Desain tabel mengutamakan kepadatan informasi seperti buku
    tulis/ledger tanpa mengorbankan keterbacaan.

------------------------------------------------------------------------

# 44. RINGKASAN EKOSISTEM

``` text
                    MONEY CHANGER DIGITAL OS
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
     FRONT OFFICE         BACK OFFICE           COMPLIANCE
        │                     │                     │
     Teller               Admin                  KYC
     Customer             Accounting             AML
     Transaction           Finance                Threshold
     Payment               Inventory              Underlying
     Waiting List          Closing                LKPBU
     WhatsApp              Document               SIPESAT
                          Numismatic              goAML
                          Employee/Shift
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                         SAAS PLATFORM
                              │
                    WEB + FLUTTER MOBILE
                              │
                    API + QUEUE + REDIS
                              │
                    AUDIT + SECURITY
```

**Status blueprint: MASTER / CONSOLIDATED**

---

# 45. ANALYTICS & VISUALIZATION ENGINE

Dashboard analitik terpusat untuk Owner, Management, Supervisor, dan role lain sesuai permission.

## Sales & Purchase Analytics

Grafik dan KPI:

- Penjualan valuta
- Pembelian valuta
- Nilai transaksi Rupiah
- Volume per valuta
- Jumlah transaksi
- Spread
- Profit
- Perbandingan periode
- Per cabang
- Per teller
- Per customer segment

Pilihan periode:

- Hari
- Minggu
- Bulan
- Tahun
- Custom range

## Currency Rate Analytics

Grafik kurs bergaya financial market/chart:

```text
USD / IDR

[1D] [3D] [7D] [1M] [2M] [3M] [1Y]

Reference Rate
Buy Rate
Sell Rate
Internal Rate
Spread
```

Range:

- 1D
- 3D
- 7D
- 1M
- 2M
- 3M
- 1Y
- Custom

Data historis wajib menggunakan `rate_snapshots` yang benar-benar tersimpan. Sistem tidak boleh membentuk histori palsu dari kurs saat ini.

## Grafik Spread & Profit

- Spread per valuta
- Spread harian/mingguan/bulanan
- Gross spread
- Estimasi/realized margin sesuai model accounting
- Profit per currency
- Profit per branch
- Profit per teller

## Customer Analytics

- Customer baru
- Customer aktif
- Jumlah transaksi
- Volume transaksi
- Customer VIP/corporate
- KYC status
- Risk distribution
- Waiting List
- Conversion Waiting List → Transaction

## Stock Analytics

- Stok per valuta
- Stok per denominasi
- Available
- Reserved
- In Transit
- Damaged/Inspection
- Stock turnover
- Stok minimum/maksimum
- Kebutuhan berdasarkan Waiting List

## Branch & Regional Analytics

Grafik wilayah dapat menggunakan bentuk berbeda sesuai kebutuhan:

- Bar chart
- Horizontal bar
- Line chart
- Area chart
- Pie/Donut
- Geographic/map visualization

Contoh metrik:

- Penjualan per wilayah
- Pembelian per wilayah
- Profit per wilayah
- Jumlah transaksi per wilayah
- Customer per wilayah
- Stok per cabang
- Perbandingan antar cabang

## Teller Analytics

- Jumlah transaksi
- Nilai transaksi
- Penjualan
- Pembelian
- Rata-rata transaksi
- Transaksi pending
- Hold transaction
- Waktu layanan
- Closing
- Selisih kas
- Produktivitas sesuai permission

## Payment Analytics

- Cash
- Transfer
- Split Cash + Transfer
- Jumlah transaksi per metode
- Nilai per metode
- Payment pending
- Payment mismatch
- Payment failed

## Compliance Analytics

- Threshold utilization
- Underlying required
- AML alerts
- High-risk customer
- KYC pending
- Compliance case
- Regulatory report status

## Global Dashboard Filter

```text
[Periode]
[Cabang]
[Wilayah]
[Valuta]
[Teller]
[Jenis Transaksi]
[Metode Pembayaran]
[Customer Segment]
```

Filter dapat diterapkan ke seluruh widget dashboard.

## Perbandingan

Mendukung:

- Periode vs periode
- Cabang vs cabang
- Wilayah vs wilayah
- Valuta vs valuta
- Teller vs teller

## Visualisasi

Chart engine minimal mendukung:

- Line
- Bar
- Horizontal Bar
- Area
- Pie
- Donut
- KPI Card
- Table/Leaderboard
- Geographic Visualization

## Export & Print

Setiap laporan/grafik yang diizinkan dapat:

- Print Preview
- Print
- Export PDF
- Export Excel
- Export CSV

Export mencantumkan periode, filter, tenant/cabang, waktu generate, dan identitas laporan bila diperlukan.

## Role-Based Analytics

Dashboard tidak menampilkan data di luar scope user.

```text
Owner
→ Semua cabang tenant

Branch Manager
→ Cabangnya

Supervisor
→ Data operasional sesuai cabang

Teller
→ Data yang diperlukan untuk operasional teller
```

---

# 46. DIGITAL ATTENDANCE — GPS + PHOTO

Absensi karyawan terintegrasi dengan Employee, Shift, Branch, Teller Workspace, Closing, dan Audit Trail.

## Check In / Check Out

- Check In
- Check Out
- Server timestamp
- Device information
- GPS latitude
- GPS longitude
- GPS accuracy
- Selfie/photo
- Branch
- Shift
- Attendance status

## Geofence

Setiap cabang dapat memiliki radius absensi.

Contoh:

```text
Cabang
  ↓
GPS Point
  ↓
Geofence Radius
  ↓
Valid / Outside Area
```

Konfigurasi:

- Radius
- Allowed accuracy
- Valid/invalid location
- Auto reject
- Approval required
- Reason when outside area

## Attendance Status

- Hadir
- Terlambat
- Pulang Cepat
- Lembur
- Izin
- Cuti
- Libur
- Tidak Hadir
- Pending Review
- Correction Approved

## Photo Attendance

Foto dapat diambil pada:

- Check In
- Check Out

Metadata absensi disimpan bersama:

- timestamp
- employee
- branch
- shift
- GPS
- device
- photo reference

Akses foto dibatasi berdasarkan permission dan seluruh akses penting dicatat di audit trail.

## Integration with Shift

```text
Schedule
→ Employee Shift
→ Check In
→ Teller/Workspace Access
→ Operational Work
→ Check Out
→ Shift Closing
```

Sistem dapat menghitung:

- keterlambatan
- jam kerja
- pulang cepat
- lembur
- ketidakhadiran

## Attendance Correction

Koreksi absensi tidak mengubah data asli secara langsung.

```text
Correction Request
→ Reason
→ Approval
→ New Version
→ Audit Trail
```

## Excel-Style Attendance Report

```text
┌───────────┬────────────┬────────┬────────┬─────────┬──────────────┐
│ Karyawan  │ Tanggal    │ Masuk  │ Keluar │ Shift   │ Status       │
├───────────┼────────────┼────────┼────────┼─────────┼──────────────┤
│ Yayan     │ 17/08/2026 │ 07:56  │ 16:04  │ Pagi    │ Hadir        │
│ Andi      │ 17/08/2026 │ 08:15  │ 16:02  │ Pagi    │ Terlambat    │
│ Siti      │ 17/08/2026 │ 07:58  │ -      │ Pagi    │ Bekerja      │
└───────────┴────────────┴────────┴────────┴─────────┴──────────────┘
```

## Attendance History

Absensi tidak ditimpa saat bulan berganti.

```text
Januari 2026
Februari 2026
Maret 2026
...
Agustus 2026
September 2026
```

Periode selesai menjadi history/read-only sesuai kebijakan dan permission.

Export:

- Print
- PDF
- Excel
- CSV

## Mobile

Flutter Android/iOS mendukung:

- GPS permission
- Camera permission
- Selfie capture
- Check In
- Check Out
- Attendance history
- Shift information
- Notification

Location and camera permissions must be explicit, and the application should only collect location/photo data when required for the attendance workflow.

## Attendance Audit

Catat:

- employee
- action
- timestamp
- branch
- location
- device
- original record
- correction
- approver
- reason

---

# 47. PRINT ENGINE — EPSON LX-310 / KERTAS 10 × 14 CM

Print Engine wajib mendukung printer dot matrix **Epson LX-310** untuk dokumen transaksi kasir dengan ukuran media sekitar **10 cm × 14 cm** sesuai setting printer/continuous form yang digunakan.

## Tujuan

- Cetak receipt transaksi
- Bukti pembayaran
- Bukti transaksi valuta
- Bukti serah terima
- Bukti closing tertentu
- Slip internal
- Dokumen customer waiting/reservation bila diperlukan

## Format Receipt Utama

Ukuran target:

```text
Lebar kertas : 10 cm
Panjang      : 14 cm
Printer      : Epson LX-310
Jenis        : Dot Matrix
```

Layout harus menggunakan **fixed-width print template** agar hasil stabil pada printer dot matrix.

Contoh:

```text
================================
        MONEY CHANGER
        NAMA PERUSAHAAN
================================
No : INV-20260817-000125
Tgl: 17-08-2026 14:32
Kasir: YAYAN
--------------------------------
CUSTOMER
BUDI
ID: ********1234
--------------------------------
TRANSAKSI
USD   10,000.00
Rate  16,450
--------------------------------
TOTAL
Rp 164,500,000
--------------------------------
PEMBAYARAN
Cash       Rp 50,000,000
Transfer   Rp114,500,000
--------------------------------
STATUS : LUNAS

Terima kasih
Dokumen resmi transaksi
================================
```

## Printer Profile

Setiap tenant/cabang dapat mempunyai konfigurasi printer:

```text
Printer Name
Printer Type
Connection
Paper Width
Paper Length
Characters Per Line
Font
Line Spacing
Cut/Feed Setting
Copies
Default Printer
```

## Connection Options

Dukungan disiapkan untuk:

- USB
- Shared/network printer bila OS print server mendukung
- Windows print spooler
- Server-side print queue
- Local print bridge/agent untuk web bila diperlukan

Untuk browser/web, sistem tidak mengandalkan browser untuk mencetak langsung ke port dot matrix. Disediakan opsi **Local Print Agent / Print Bridge** agar template fixed-width dapat dikirim ke printer secara stabil.

## Template Manager

Admin dapat memilih:

- Receipt standar
- Receipt ringkas
- Bukti pembayaran
- Bukti transaksi
- Slip internal
- Template custom

Template menggunakan field dinamis:

```text
{{company_name}}
{{branch_name}}
{{transaction_no}}
{{invoice_no}}
{{receipt_no}}
{{transaction_date}}
{{customer_name}}
{{currency}}
{{denomination}}
{{quantity}}
{{rate}}
{{subtotal}}
{{payment_cash}}
{{payment_transfer}}
{{grand_total}}
{{cashier_name}}
{{supervisor_name}}
```

## Print Actions

Pada Teller Workspace:

```text
[SIMPAN]
[HOLD]
[BAYAR]
[CETAK]
[CETAK ULANG]
[WHATSAPP]
```

## Reprint Security

Cetak ulang wajib tercatat:

```text
Original Print
Reprint #1
Reprint #2
...
```

Dengan informasi:

- siapa mencetak
- waktu
- alasan reprint bila diwajibkan
- printer
- dokumen
- transaction_id

## Multi-Copy

Dapat dikonfigurasi:

- Customer copy
- Branch copy
- Accounting copy
- Compliance copy bila diperlukan

## Print Preview

Web menyediakan preview sebelum print untuk printer/format yang mendukung preview.

Untuk dot matrix, preview menggunakan **monospace fixed-width** agar mendekati hasil fisik.

## Print Failure

Jika printer offline/gagal:

```text
Print Job
→ Queue
→ Failed
→ Retry
```

Transaksi **tidak boleh dianggap gagal hanya karena printer gagal**.

Status transaksi dan status print dipisahkan:

```text
Transaction = SUCCESS
Print        = FAILED
```

Teller dapat melakukan:

```text
[RETRY PRINT]
```

## Print History

Semua print job disimpan:

- tenant
- branch
- transaction
- document
- user
- printer
- timestamp
- status
- retry count

## PDF / A4 / Other Printer

Print Engine tetap mendukung printer lain dan PDF.

```text
Receipt 10×14 cm
Epson LX-310

PDF 10×14 cm
PDF A4
PDF A5
Thermal Printer
Office Printer
```

Template dapat menggunakan profile berbeda tanpa mengubah data transaksi.

## Database Domain

Tambahan domain:

```text
printer_profiles
print_templates
print_jobs
print_job_items
print_logs
```

---

# 48. PRINT DESIGN STANDARD

Untuk receipt 10 × 14 cm:

- Margin dibuat minimum sesuai kemampuan printer/form
- Font monospace
- Kolom nominal rata kanan
- Kolom item rata kiri
- Nomor transaksi mudah dibaca
- Nama customer dapat disingkat sesuai batas karakter
- Informasi sensitif dimasking sesuai permission
- QR/barcode hanya digunakan bila printer dan workflow mendukung
- Tidak mengandalkan warna
- Tetap terbaca dalam hasil dot matrix
- Template dibuat padat seperti buku kas/ledger

## Contoh kolom transaksi

```text
VALUTA  QTY       RATE       TOTAL
USD     10,000    16,450     164,500,000
EUR      5,000    19,200      96,000,000
------------------------------------
TOTAL                         260,500,000
```

Untuk transaksi panjang, sistem dapat membuat beberapa halaman/lembar sesuai paper profile tanpa memotong item secara tidak aman.

---

# 49. TRANSACTION CART — MULTI CURRENCY

Setiap transaksi wajib memiliki **Transaction Cart** agar satu customer dapat melakukan beberapa item/mata uang dalam satu transaksi.

## Prinsip

```text
1 CUSTOMER
    ↓
1 TRANSACTION
    ↓
TRANSACTION CART
    ├── USD
    ├── EUR
    ├── SGD
    ├── AUD
    └── JPY
```

Satu transaksi dapat memiliki 2–5+ mata uang sesuai kebutuhan dan konfigurasi tenant.

## Cart Item

Setiap item menyimpan minimal:

- Currency
- Denomination bila digunakan
- Quantity
- Nominal
- Rate
- Spread
- Rate snapshot
- Subtotal
- Buy/Sell direction
- Stock impact
- Notes

## Contoh Teller Workspace

```text
┌──────────────────────────────────────────────────────────┐
│ TRANSAKSI #TRX-260817-000125                             │
│ CUSTOMER: BUDI                                           │
├────────┬──────────┬──────────┬──────────────┬────────────┤
│ VALUTA │ NOMINAL  │ KURS     │ SUBTOTAL RP  │ AKSI       │
├────────┼──────────┼──────────┼──────────────┼────────────┤
│ USD    │ 10,000   │ 16,450   │ 164,500,000  │ Edit/Hapus │
│ EUR    │ 2,000    │ 19,200   │  38,400,000  │ Edit/Hapus │
│ SGD    │ 5,000    │ 12,900   │  64,500,000  │ Edit/Hapus │
└────────┴──────────┴──────────┴──────────────┴────────────┘

Grand Total                  Rp 267,400,000

[ + TAMBAH VALUTA ]

PEMBAYARAN
○ Cash
○ Transfer
○ Split Cash + Transfer

[ HOLD ] [ SIMPAN ] [ BAYAR ] [ CETAK ]
```

## Add Item

Teller dapat menekan:

```text
[ + TAMBAH VALUTA ]
```

Kemudian:

```text
Pilih Valuta
→ Nominal
→ Denominasi/quantity bila diperlukan
→ Rate
→ Spread
→ Subtotal
→ Add to Cart
```

## Cart Rules

- Satu cart hanya milik satu `transaction_id`.
- Satu transaksi hanya milik satu customer.
- Cart dapat berisi banyak `transaction_items`.
- Setiap item dapat memiliki currency berbeda.
- Setiap item menyimpan rate snapshot sendiri.
- Menambah/menghapus item sebelum finalisasi tidak mengubah histori transaksi yang sudah finalized; perubahan final menggunakan adjustment/reversal sesuai aturan.
- Stock reservation dan stock posting dilakukan per item.
- Threshold/regulatory calculation menjumlahkan item yang relevan berdasarkan rule.
- Accounting posting dibuat dari keseluruhan transaksi dan detail item.

## Hold Cart

Cart dapat ditahan:

```text
CART
→ HOLD
→ tetap tersimpan
→ customer melanjutkan perhitungan
→ RESUME
→ tambah/edit item
→ finalisasi
```

Cart yang di-hold dapat ditampilkan pada Multi Transaction Workspace.

## Multi Customer Isolation

Cart tidak boleh bercampur antar customer.

```text
TAB 01 — BUDI
Cart:
USD + EUR + SGD

TAB 02 — ANDI
Cart:
JPY + AUD

TAB 03 — SITI
Cart:
USD
```

## Payment

Grand total seluruh cart menjadi dasar pembayaran, tetapi payment tetap dapat menyimpan breakdown:

```text
Cash
Transfer
Split Cash + Transfer
```

## Receipt

Receipt menampilkan seluruh item cart:

```text
VALUTA    NOMINAL      RATE        TOTAL
USD       10,000       16,450      164,500,000
EUR        2,000       19,200       38,400,000
SGD        5,000       12,900       64,500,000
-------------------------------------------
GRAND TOTAL                         267,400,000
```

Jika item terlalu banyak untuk kertas 10×14 cm, Print Engine membuat lanjutan halaman/lembar sesuai printer profile.

## Database

```text
transactions
transaction_items
transaction_item_rates
transaction_payments
transaction_payment_items
```

`transaction_items` menjadi sumber detail cart, sedangkan `transactions` menyimpan header transaksi/customer/status/total.

## API

Contoh endpoint:

```text
POST   /api/v1/transactions
GET    /api/v1/transactions/{id}
POST   /api/v1/transactions/{id}/items
PUT    /api/v1/transactions/{id}/items/{item}
DELETE /api/v1/transactions/{id}/items/{item}
POST   /api/v1/transactions/{id}/hold
POST   /api/v1/transactions/{id}/resume
POST   /api/v1/transactions/{id}/payment
POST   /api/v1/transactions/{id}/finalize
POST   /api/v1/transactions/{id}/print
```

## Important

**Cart adalah bagian inti Transaction Engine**, bukan modul terpisah. Semua transaksi—baik satu valuta maupun multi-valuta—menggunakan cart yang sama.

---

# 48. TRANSACTION CART — MULTI CURRENCY ⭐

Semua form transaksi utama menggunakan **Keranjang Transaksi (Transaction Cart)**.

Tujuannya agar satu customer dapat melakukan transaksi dengan **2–5 atau lebih mata uang** dalam satu transaksi/invoice, tanpa membuat transaksi utama terpisah.

## Konsep

```text
CUSTOMER
   ↓
TRANSACTION CART
   ├── USD
   ├── EUR
   ├── SGD
   ├── JPY
   └── AUD
   ↓
PAYMENT
   ↓
CONFIRM
   ↓
STOCK + CASH/BANK + ACCOUNTING
   ↓
INVOICE / RECEIPT
```

## Contoh Teller

```text
┌──────────────────────────────────────────────────────────────┐
│ TRANSAKSI #TRX-260817-000125                                │
│ Customer: Budi Santoso                                      │
├──────┬───────────┬──────────┬──────────┬───────────────────┤
│      │ VALUTA    │ NOMINAL  │ KURS     │ TOTAL RP          │
├──────┼───────────┼──────────┼──────────┼───────────────────┤
│  01  │ USD       │ 10,000   │ 16,450   │ 164,500,000       │
│  02  │ EUR       │ 2,000    │ 19,200   │ 38,400,000        │
│  03  │ SGD       │ 5,000    │ 12,900   │ 64,500,000        │
├──────┴───────────┴──────────┴──────────┴───────────────────┤
│ TOTAL ITEM: 3                                                │
│ GRAND TOTAL: Rp 267,400,000                                  │
└──────────────────────────────────────────────────────────────┘
```

## Cart Actions

Setiap item dapat:

- Add currency
- Edit nominal
- Edit denomination
- Edit rate bila permission mengizinkan
- Remove item
- Duplicate item
- Change currency
- Hold item/cart
- Recalculate
- View stock
- View rate
- View spread

## Multi Currency

Default UI mendukung:

- 1 currency
- 2 currencies
- 3 currencies
- 4 currencies
- 5 currencies
- >5 currencies dengan scroll/cart expansion

Tidak membuat batas database hanya 5; angka 2–5 adalah target UX umum.

## Rate Per Item

Setiap item mempunyai snapshot sendiri:

```text
Currency
Reference Rate
Spread
Final Rate
Source
Fetched At
Locked At
Rate ID
```

Perubahan kurs pada item lain tidak mengubah item yang sudah di-lock.

## Stock Check Per Item

Saat item dimasukkan:

```text
USD 10,000
↓
Check Available Stock
↓
Available / Insufficient / Reserved
```

Semua item harus lolos validasi stok atau masuk status yang sesuai sebelum transaksi final.

## Threshold Integration

Threshold dihitung terhadap transaksi customer secara keseluruhan sesuai regulatory rule, termasuk ekuivalen USD dari seluruh item yang relevan.

```text
USD → USD Equivalent
EUR → USD Equivalent
SGD → USD Equivalent
        ↓
TOTAL CUSTOMER MONTHLY EXPOSURE
        ↓
THRESHOLD ENGINE
```

## Payment Cart

Grand total dari seluruh item menjadi dasar pembayaran.

Mendukung:

```text
CASH
TRANSFER
SPLIT CASH + TRANSFER
```

Split tidak menggunakan QRIS pada workflow yang dimaksud.

## Payment Allocation

Sistem menyimpan:

```text
Grand Total
Cash Amount
Transfer Amount
Payment Status
Verification Status
```

Bila diperlukan, payment allocation dapat ditautkan ke item/valuta atau cukup pada level transaction sesuai kebijakan accounting/payment.

## Transaction Number vs Cart

Cart bukan transaksi final terpisah.

```text
Cart ID
   ↓
Transaction ID
   ↓
Transaction Items
   ├── Item 1 USD
   ├── Item 2 EUR
   ├── Item 3 SGD
   └── Item 4 JPY
```

Semua item memiliki parent `transaction_id`.

## Hold / Resume

Cart dapat di-hold bersama seluruh item:

```text
Cart #125
├── USD
├── EUR
└── SGD

STATUS: HOLD
```

Saat resume, seluruh item kembali dengan snapshot dan status terakhir yang valid.

## Multi Customer Workspace + Cart

Multi Transaction Workspace tetap berlaku.

```text
TAB 01 — BUDI
Cart:
USD + EUR + SGD

TAB 02 — ANDI
Cart:
JPY + USD

TAB 03 — SITI
Cart:
EUR

TAB 04 — RUDI
Cart:
USD + SGD + AUD
```

Jadi:

**1 tab/customer = 1 transaction workspace/cart**, sementara setiap cart dapat memiliki banyak transaction items.

## Print

Receipt menampilkan seluruh item cart:

```text
VALUTA    NOMINAL      RATE        TOTAL
USD       10,000       16,450      164,500,000
EUR        2,000       19,200       38,400,000
SGD        5,000       12,900       64,500,000
---------------------------------------------
GRAND TOTAL                         267,400,000
```

Tetap mendukung:

- Epson LX-310
- Kertas 10 × 14 cm
- PDF
- Printer lain

Jika item terlalu banyak untuk satu lembar 10 × 14 cm, Print Engine membuat halaman/lembar lanjutan secara aman dan tetap menjaga nomor transaksi yang sama.

## Accounting

Setiap item dapat menghasilkan posting sesuai currency dan account mapping, sedangkan transaksi menjadi parent/reference.

## Database Domain

Tambahan/penegasan:

```text
transactions
transaction_items
transaction_item_rates
transaction_item_stock_allocations
transaction_payments
transaction_payment_allocations
transaction_carts
```

Relasi utama:

```text
transaction_carts
       ↓
transactions
       ↓
transaction_items
       ↓
rates / stock / payment / accounting
```

## Definition of Done

- Semua transaksi utama memiliki cart.
- Satu cart dapat memiliki banyak currency.
- 2–5 currency menjadi UX utama.
- >5 tetap didukung.
- Setiap item memiliki rate snapshot.
- Setiap item divalidasi terhadap stock.
- Threshold menghitung agregasi yang relevan.
- Payment dihitung dari grand total.
- Cash/Transfer/Split tersedia.
- Hold/Resume mempertahankan cart.
- Print menampilkan seluruh item.
- Accounting dapat memetakan item dan parent transaction.
- Audit trail mencatat perubahan cart/item.

---

# 49. MIXED BUY + SELL TRANSACTION CART — ONE INVOICE ⭐

Satu customer dapat melakukan **jual dan beli valuta sekaligus dalam satu invoice/transaksi utama**.

Contoh:

> Customer menjual USD kepada Money Changer, kemudian membeli SAR dan MYR.

Tidak perlu membuat dua invoice terpisah.

## Contoh Transaksi

```text
CUSTOMER: BUDI SANTOSO
TRANSACTION: TRX-260817-000130

JUAL KE MONEY CHANGER
┌────────┬──────────┬─────────┬──────────────┐
│ VALUTA │ NOMINAL  │ KURS    │ NILAI RP     │
├────────┼──────────┼─────────┼──────────────┤
│ USD    │ 10,000   │ 16,250  │ 162,500,000  │
└────────┴──────────┴─────────┴──────────────┘

BELI DARI MONEY CHANGER
┌────────┬──────────┬─────────┬──────────────┐
│ VALUTA │ NOMINAL  │ KURS    │ NILAI RP     │
├────────┼──────────┼─────────┼──────────────┤
│ SAR    │ 25,000   │ 4,500   │ 112,500,000  │
│ MYR    │  8,000   │ 4,000   │  32,000,000  │
└────────┴──────────┴─────────┴──────────────┘

JUAL CUSTOMER                 Rp 162,500,000
BELI CUSTOMER                -Rp 144,500,000
─────────────────────────────────────────────
NET SETTLEMENT                Rp 18,000,000
```

Dalam contoh tersebut, customer menyerahkan USD dan menerima SAR + MYR, lalu terdapat **net settlement Rp18.000.000 kepada customer**. Jika hasil perhitungan sebaliknya, customer yang membayar selisih.

## Transaction Cart Structure

```text
TRANSACTION CART
│
├── SELL TO MONEY CHANGER
│   └── USD 10,000
│
└── BUY FROM MONEY CHANGER
    ├── SAR 25,000
    └── MYR 8,000
```

Setiap item mempunyai:

```text
side
currency
amount
denomination
rate
rate_snapshot_id
spread
subtotal
stock_effect
cash_flow_effect
accounting_mapping
```

`side`:

```text
SELL_TO_MONEY_CHANGER
BUY_FROM_MONEY_CHANGER
```

## Net Settlement Engine

Sistem menghitung seluruh leg dalam basis settlement yang dikonfigurasi, misalnya IDR:

```text
Customer Sell Value
-
Customer Buy Value
=
Net Settlement
```

Status hasil:

```text
NET RECEIVABLE
→ Money Changer membayar customer

NET PAYABLE
→ Customer membayar Money Changer

BALANCED
→ Tidak ada selisih settlement
```

Net settlement tidak menghapus detail masing-masing valuta. Semua leg tetap tercatat untuk stok, accounting, compliance, dan audit.

## Payment

Mendukung:

```text
CASH
TRANSFER
SPLIT CASH + TRANSFER
```

Untuk settlement bersih:

```text
Net Amount
→ Cash
→ Transfer
→ Split Cash + Transfer
```

Jika customer menyerahkan valuta fisik dan menerima valuta lain, penerimaan/penyerahan valuta tetap dicatat sebagai stock movement terpisah dari payment settlement.

## Stock Effect

Contoh:

```text
CUSTOMER SELL USD
→ USD Stock +10,000

CUSTOMER BUY SAR
→ SAR Stock -25,000

CUSTOMER BUY MYR
→ MYR Stock -8,000
```

Semua movement menggunakan `transaction_id` yang sama sehingga satu invoice dapat direkonsiliasi secara menyeluruh.

## Rate Snapshot Per Leg

USD, SAR, dan MYR dapat memiliki rate masing-masing.

```text
USD
Reference Rate
Spread
Final Rate
Snapshot

SAR
Reference Rate
Spread
Final Rate
Snapshot

MYR
Reference Rate
Spread
Final Rate
Snapshot
```

Rate yang sudah di-lock tidak berubah ketika rate pasar diperbarui.

## Threshold & Compliance

Regulatory Threshold Engine memproses transaksi sesuai `side` dan aturan regulasi yang berlaku.

Sistem dapat membedakan:

```text
Customer Sell
Customer Buy
```

dan tidak otomatis menerapkan rule threshold pembelian valuta kepada sisi jual tanpa dasar rule yang sesuai.

Seluruh legs tetap berada dalam satu parent transaction sehingga compliance dapat melihat keseluruhan aktivitas customer.

## KYC

Satu KYC/customer verification dapat digunakan untuk seluruh legs dalam parent transaction, selama status KYC masih valid dan tidak ada rule yang mengharuskan review tambahan.

## Receipt / Invoice

Satu invoice menampilkan dua kelompok:

```text
JUAL VALUTA
────────────────────────
USD 10,000
Rp 162,500,000

BELI VALUTA
────────────────────────
SAR 25,000
Rp 112,500,000

MYR 8,000
Rp 32,000,000
────────────────────────
NET SETTLEMENT
Rp 18,000,000
```

Receipt dapat menampilkan:

- Transaction number
- Invoice number
- Customer
- KYC reference sesuai permission
- Jual
- Beli
- Rate masing-masing
- Spread
- Subtotal
- Net settlement
- Payment method
- Teller
- Supervisor bila ada
- Timestamp
- Status

Untuk Epson LX-310 10×14 cm, layout dapat dibuat compact dan menggunakan lembar lanjutan jika detail terlalu panjang.

## Multi-Currency + Mixed Side

Satu cart dapat memiliki kombinasi:

```text
SELL USD
SELL EUR

BUY SAR
BUY MYR
BUY SGD
```

atau:

```text
SELL USD
BUY SAR
```

atau:

```text
BUY USD
SELL EUR
BUY MYR
```

Jumlah item tidak dibatasi secara database; UX utama ditargetkan nyaman untuk 2–5+ item.

## Multi Transaction Workspace

Contoh:

```text
TAB 01 — BUDI
SELL: USD
BUY : SAR + MYR

TAB 02 — ANDI
SELL: EUR
BUY : USD + SGD

TAB 03 — SITI
BUY : USD

TAB 04 — RUDI
SELL: JPY + SGD
```

Setiap tab memiliki parent transaction/cart sendiri.

## Accounting

Parent transaction menjadi referensi utama, sedangkan setiap leg menghasilkan stock/cash/bank/accounting effect sesuai mapping.

```text
Parent Transaction
├── Sell USD
├── Buy SAR
├── Buy MYR
├── Net Settlement
└── Accounting Entries
```

## Database

Penegasan struktur:

```text
transaction_carts
transactions
transaction_items
transaction_item_rates
transaction_item_stock_allocations
transaction_payments
transaction_payment_allocations
transaction_settlements
```

`transaction_items.side` membedakan jual/beli.

`transaction_settlements` menyimpan hasil net settlement dan metode settlement.

## Definition of Done

- Satu invoice dapat memiliki sisi SELL dan BUY sekaligus.
- Satu customer dapat menjual satu atau beberapa valuta.
- Satu customer dapat membeli satu atau beberapa valuta.
- Sell USD + Buy SAR + Buy MYR dapat berada dalam satu parent transaction.
- Setiap leg memiliki rate snapshot.
- Stock movement tiap valuta tercatat.
- Net settlement dihitung otomatis.
- Cash/Transfer/Split tersedia.
- Threshold/Compliance melihat parent transaction dan leg sesuai rule.
- Satu invoice/receipt dapat mencetak seluruh detail.
- Accounting dapat merekonsiliasi seluruh legs.
- Hold/Resume mempertahankan seluruh cart.
- Audit trail mencatat perubahan setiap leg.

---

# 50. CUSTOMER RECEIPT DESIGN — FINAL LX-310 10 × 14 CM

Standar nota customer menggunakan layout **fixed-width, monospace, dense ledger style** untuk Epson LX-310 dengan target kertas 10 × 14 cm.

## Header

Identitas perusahaan berada paling atas.

```text
MONEY CHANGER
PT ALMARA VALUTA
Alamat
Telepon
```

## Customer Header — 2 Kolom

Tepat di bawah data perusahaan, informasi dokumen dan customer dibagi dua:

```text
┌────────────────────┬─────────────────┐
│ NO. INVOICE        │ CUSTOMER        │
│ INV-260817-000125  │ BUDI SANTOSO    │
│ 17-08-2026 16:42   │ 0812******7890  │
└────────────────────┴─────────────────┘
```

### Kiri

- Nomor invoice
- Tanggal
- Jam

### Kanan

- Nama customer
- Nomor telepon yang dimasking

Nomor identitas/NIK tidak dicetak penuh pada nota customer.

## Single-Side Transaction

### Penjualan

```text
JUAL VALUTA
──────────────────────────────────────
VALUTA   NOMINAL      KURS
USD      10,000       Rp 16.250
──────────────────────────────────────
TOTAL NILAI                 Rp162.500.000
```

### Pembelian

```text
BELI VALUTA
──────────────────────────────────────
VALUTA   NOMINAL      KURS
USD      10,000       Rp 16.450
──────────────────────────────────────
TOTAL NILAI                 Rp164.500.000
```

## Mixed Transaction — One Invoice

Satu invoice dapat berisi penjualan dan pembelian sekaligus.

Tidak menggunakan judul `JUAL & BELI`, karena masing-masing bagian sudah diberi label.

```text
JUAL VALUTA
──────────────────────────────────────
VALUTA   NOMINAL      KURS
USD      10,000       Rp 16.250
──────────────────────────────────────
TOTAL JUAL                  Rp162.500.000

BELI VALUTA
──────────────────────────────────────
VALUTA   NOMINAL      KURS
SAR      25,000       Rp  4.500
MYR       8,000       Rp  4.000
──────────────────────────────────────
TOTAL BELI                  Rp144.500.000
```

## Payment Section

Untuk transaksi yang membutuhkan pembayaran/settlement, nota menampilkan metode pembayaran yang relevan:

```text
PEMBAYARAN
──────────────────────────────────────
Cash                         Rp10.000.000
Transfer                      Rp8.000.000
```

Metode dapat berupa:

- Cash
- Transfer
- Split Cash + Transfer

QRIS tidak digunakan sebagai metode split pada workflow yang telah ditetapkan.

## Informasi yang Tidak Dicetak

Untuk menjaga nota customer tetap ringkas dan tidak membuka informasi internal:

- Net Settlement tidak dicetak.
- Status transaksi tidak dicetak.
- Nama Teller tidak dicetak.
- Detail accounting tidak dicetak.
- Detail stok tidak dicetak.
- Detail internal compliance tidak dicetak.

Informasi tersebut tetap tersedia di backend, audit trail, closing, accounting, dan laporan internal sesuai permission.

## Signature Area

Bagian bawah:

```text
       CUSTOMER          TELLER

       __________        __________
```

Nama teller tidak dicetak; hanya area tanda tangan.

## Footer

```text
Terima kasih telah
bertransaksi
```

## Print Rules

- Fixed-width
- Monospace
- Tidak bergantung pada warna
- Angka rata kanan
- Label rata kiri
- Tidak mengecilkan font secara berlebihan
- Tidak memotong baris item
- Jika item melebihi tinggi 10 × 14 cm, gunakan continuation page
- Nomor invoice tetap sama pada halaman lanjutan
- Print preview menggunakan ukuran dan font yang mendekati output dot matrix

## Final Template Variants

Sistem memiliki tiga kondisi template:

```text
1. Hanya JUAL
   → JUAL VALUTA

2. Hanya BELI
   → BELI VALUTA

3. Mixed
   → JUAL VALUTA
   → BELI VALUTA
```

Tidak ada heading `JUAL & BELI`.

## Security / Privacy

- Nomor telepon dimasking.
- Identitas sensitif tidak dicetak penuh.
- Data customer pada print hanya sesuai field yang ditetapkan template.
- Reprint mengikuti permission.
- Setiap print/reprint masuk `print_logs` dan audit trail.
