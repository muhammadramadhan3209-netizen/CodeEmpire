CODE EMPIRE V0.1.4 — PHASE 4: COMPLETE & ASSET-READY
=====================================================

Cara menjalankan
----------------
1. Ekstrak folder project.
2. Buka terminal di folder yang berisi index.html.
3. Jalankan server lokal:
   python -m http.server 8080
4. Buka http://127.0.0.1:8080 di browser.

Core game
---------
- Coding tap, passive income, XP, level, energy, upgrade, dan hardware shop.
- Tiga project awal dengan timer, reward, XP, dan passive income setelah rilis.
- Save otomatis ke localStorage, save manual, reset, serta export/import via kode teks.
- Pendapatan offline maksimal 4 jam dengan efisiensi 60%.
- Save Phase 3 tetap dapat dimigrasikan; nilai employees lama dikonversi menjadi team.

Startup empire
--------------
- Recruitment pool, signing cost, role, trait, salary, kapasitas office, dan refresh kandidat.
- Training employee, Junior/Senior/Lead promotion, bonus morale, payroll, dan payroll shortage.
- Sepuluh tier office serta department Development, Marketing, Sales, dan Security/IT.
- Assignment employee per role dan upgrade department dengan efek lintas sistem.
- Delapan tier client, tiga mode delivery, skill match, rating 1–5, review, dan repeat business.
- Product Lab untuk Productivity, Game, Fintech, dan Security, termasuk maintenance/decay.
- Skill training Frontend, Backend, AI, dan Security dengan energy serta timer.
- Career title dinamis untuk jalur Legit, Hacker, dan Grey.
- Achievement kategori Legit, Hacking, Growth, dan Dual Path dengan reward.
- Random event non-hacking, investor offer, cap table, buyback, dividen, dan risiko identity exposed.
- Empat kompetitor, company valuation, market event, category pressure, dan leaderboard.

Hacker duality
--------------
- Hacker Hub dengan 10 kontrak, memory minigame, Heat, Dark Rep, dan Clean Rep.
- Investigasi, lie low, lawyer/bribe, status Wanted, office freeze, tertangkap, dan identity exposed.
- Dark Market tools, moral fork ethical/shadow, Hidden Server Room, serta security team bonus.
- Job hacking hanya berjalan ketika game terbuka dan tidak menerima reward offline.

Asset-ready
-----------
- Semua placeholder visual screen berasal dari js/data/assetMap.js.
- Visual dinamis memakai data-asset="kategori-key".
- Character, office, avatar, product, dan achievement memakai container berukuran/aspect-ratio tetap.
- Animasi idle/typing/stressed/celebrate/hacking memakai class dan CSS keyframe.
- Warna tema didefinisikan melalui CSS custom properties di :root.

Aset visual (v1 - SVG icon set)
-------------------------------
- 94 file SVG di folder assets/, satu file per kategori-key (mis. assets/avatar-frontend.svg),
  namanya sama persis dengan atribut data-asset di HTML.
- assetMap.js sudah diarahkan ke path assets/*.svg (bukan emoji lagi).
- Fungsi asset() di js/screens.js dan hydrateStaticAssets() di js/navigation.js
  merender <img src="..."> dari assetMap, bukan <span> teks emoji.
- Untuk ganti ke aset final (ilustrasi/sprite komisi, dsb): cukup timpa file
  assets/<kategori>-<key>.svg dengan file baru bernama sama (format lain seperti .png
  juga bisa, tinggal ubah value path di assetMap.js), tidak perlu ubah screens.js.
- scripts/build.mjs sudah meng-copy folder assets/ ke dist/ saat build produksi.

Pengujian dan build
-------------------
1. Pastikan Node.js tersedia.
2. Jalankan npm test.
3. Jalankan npm run build.
4. Hasil build siap-deploy dibuat di folder dist/.

Teknologi
---------
HTML, CSS, JavaScript ES modules, tanpa framework atau dependency runtime eksternal.
