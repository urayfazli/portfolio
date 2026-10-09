/* ============================================================
   0xray portfolio — language toggle (EN <-> ID)
   - Every translatable string lives in `translations` below.
   - HTML hooks: data-i18n (plain text), data-i18n-html (markup),
     data-i18n-aria (aria-label).
   - Choice persisted in localStorage ("portfolio-lang"), default "en".
   - Also exposed as window.I18N for app.js (nav toggle labels).
   ============================================================ */
(function () {
  'use strict';

  var translations = {
    en: {
      "meta.title": "Uray Fazli — 0xray | Web3 Portfolio",
      "meta.desc": "Uray Fazli (0xray) — Node operator on Aptos, Sei and SubQuery. Airdrop hunter, testnet participant, NFT collector.",
      "a11y.skip": "Skip to content",
      "a11y.brand": "0xray home",
      "a11y.profile": "Profile photo of Uray Fazli",
      "a11y.chips": "Focus areas",
      "a11y.scrollhint": "Scroll to about section",
      "lang.toggle.aria": "Switch language",
      "nav.toggle.open": "Open menu",
      "nav.toggle.close": "Close menu",
      "nav.about": "About",
      "nav.nodes": "Nodes",
      "nav.stack": "Skills",
      "nav.journey": "Journey",
      "nav.activities": "Activities",
      "nav.projects": "Projects",
      "nav.contact": "Contact",
      "hero.badge": "Validator & Testnet Enthusiast",
      "hero.alias": "aka <span class=\"text-primary\">0xray</span>",
      "hero.tagline": "Securing networks. Hunting opportunities.<br />Collecting culture.",
      "hero.cta.github": "View GitHub",
      "hero.cta.contact": "Get in Touch",
      "chip.airdrop": "Airdrops",
      "chip.testnet": "Testnets",
      "chip.nft": "NFTs",
      "stats.networks": "Networks Secured",
      "stats.monitoring": "Node Monitoring",
      "stats.repos": "Public Repositories",
      "about.eyebrow": "About",
      "about.title": "Infrastructure mind,<br />web3 heart.",
      "about.lead": "I'm Uray Fazli — a node operator securing the <strong>Aptos</strong>, <strong>Sei</strong> and <strong>SubQuery</strong> networks. Beyond infrastructure, I'm deep in the web3 trenches: hunting airdrops, stress-testing testnets, and collecting NFTs.",
      "about.whatido": "What I do",
      "about.w1": "Run validator & node infrastructure across multiple networks",
      "about.w2": "Participate early in testnets — run nodes, report bugs, give feedback",
      "about.w3": "Track emerging protocols for airdrop opportunities, systematically",
      "about.w4": "Collect NFTs with lasting communities and culture",
      "about.background": "Background",
      "about.b1": "Operating validator infrastructure that helps secure networks",
      "about.b2": "Linux server administration and hardening",
      "about.b3": "Testnet participation and protocol feedback",
      "about.b4": "On-chain research and airdrop tracking",
      "nodes.eyebrow": "Node Operations",
      "nodes.title": "Running infrastructure<br />that networks rely on.",
      "nodes.desc": "Validator and node operations across three networks — keeping chains secure, decentralized, and performant.",
      "role.validator": "Validator",
      "role.nodeop": "Node Operator",
      "nodes.aptos.title": "Aptos Network",
      "nodes.sei.title": "Sei Network",
      "nodes.subquery.title": "SubQuery Network",
      "nodes.aptos.text": "Operating validator infrastructure on Aptos — a high-throughput Layer 1 built for mass adoption.",
      "nodes.sei.text": "Running validator infrastructure on Sei — the parallelized Layer 1 purpose-built for high-performance trading apps.",
      "nodes.subquery.text": "Operating indexing infrastructure on SubQuery — powering fast, reliable data for web3 applications.",
      "nodes.focus.label": "Operational focus:",
      "nodes.aptos.focus": "uptime & reliability, monitoring, network upgrades.",
      "nodes.sei.focus": "performance tuning, monitoring, governance participation.",
      "nodes.subquery.focus": "indexing performance, data reliability, query optimization.",
      "tag.layer1": "Layer 1",
      "tag.bft": "BFT Consensus",
      "tag.uptime": "Uptime & reliability",
      "tag.monitoring": "Monitoring",
      "tag.upgrades": "Network upgrades",
      "tag.parallelized": "Parallelized",
      "tag.perftune": "Performance tuning",
      "tag.governance": "Governance participation",
      "tag.indexing": "Indexing",
      "tag.datainfra": "Data Infra",
      "tag.indexingperf": "Indexing performance",
      "tag.datarel": "Data reliability",
      "tag.queryopt": "Query optimization",
      "stack.eyebrow": "Tech Stack",
      "stack.title": "Skills that keep<br />nodes running.",
      "stack.desc": "The operational toolkit behind reliable validator infrastructure.",
      "stack.s1t": "Validator Operations",
      "stack.s1d": "Running and maintaining validator nodes that help secure blockchain networks.",
      "stack.s2t": "Linux Server Administration",
      "stack.s2d": "Hardened, production-grade Linux server setup, configuration, and maintenance.",
      "stack.s3t": "Docker & Containerization",
      "stack.s3d": "Isolated, reproducible node deployments with containers and compose workflows.",
      "stack.s4t": "Monitoring & Alerting",
      "stack.s4d": "Around-the-clock health checks and alerts to catch issues before they escalate.",
      "stack.s5t": "Testnet Participation",
      "stack.s5d": "Early-network testing, bug reports, and feedback that improve mainnet launches.",
      "stack.s6t": "On-chain Research",
      "stack.s6d": "Reading on-chain data to surface trends, opportunities, and project signals.",
      "journey.eyebrow": "Journey",
      "journey.title": "Where I am,<br />where I'm headed.",
      "journey.j1t": "Running validator infrastructure",
      "journey.j1d": "Operating nodes that help secure networks — uptime, upgrades, and reliability first.",
      "journey.j2t": "Expanding across networks",
      "journey.j2d": "Aptos, Sei, and SubQuery — multi-network operations built on shared tooling and discipline.",
      "journey.j3t": "Deep in the ecosystem",
      "journey.j3d": "Testnets, airdrop research, and NFT collecting — staying close to where web3 is moving.",
      "activities.eyebrow": "Web3 Activities",
      "activities.title": "Deep in the trenches.",
      "activities.desc": "Beyond running nodes — actively participating in the ecosystem, from early testnets to on-chain culture.",
      "act.a1t": "Airdrop Hunter",
      "act.a1d": "Tracking emerging protocols, completing quests, and positioning early — systematically, not randomly. On-chain activity across networks, documented and repeatable.",
      "act.a2t": "Testnet Participant",
      "act.a2d": "Stress-testing networks before mainnet — running nodes, reporting bugs, and giving feedback that ships. Early by design, thorough by habit.",
      "act.a3t": "NFT Collector",
      "act.a3d": "Collecting digital culture — from profile pictures to on-chain art backed by lasting communities. Curating for conviction, not hype.",
      "projects.eyebrow": "Projects",
      "projects.title": "Builds & experiments.",
      "projects.desc": "Tools and bots for the web3 trenches — on-chain trackers, Telegram bots, and testnet tooling.",
      "proj.badge.tooling": "Tooling",
      "proj.badge.experiments": "Experiments",
      "proj.badge.monitoring": "Monitoring",
      "proj.p1d": "Tools for tracking testnet participation — stays organized across networks and tasks.",
      "proj.p2d": "Solana on-chain tracking experiments — monitoring wallets and token activity.",
      "proj.p3d": "Web3 signal radar & monitoring — keeping watch on what moves in the space.",
      "proj.tag.testnet": "Testnet",
      "proj.tag.tracking": "Tracking",
      "proj.tag.onchain": "On-chain",
      "proj.viewrepo": "View repo →",
      "cta.title": "See everything I've shipped",
      "cta.text": "Full source code, experiments, and works in progress live on GitHub.",
      "contact.eyebrow": "Contact",
      "contact.title": "Let's connect.",
      "contact.desc": "Open to validator collaborations, testnet programs, and web3 conversations.",
      "footer.note": "Designed with the Binance design language · Built with vanilla HTML/CSS/JS"
    },
    id: {
      "meta.title": "Uray Fazli — 0xray | Portofolio Web3",
      "meta.desc": "Uray Fazli (0xray) — Operator node di Aptos, Sei, dan SubQuery. Pemburu airdrop, partisipan testnet, kolektor NFT.",
      "a11y.skip": "Lewati ke konten",
      "a11y.brand": "Beranda 0xray",
      "a11y.profile": "Foto profil Uray Fazli",
      "a11y.chips": "Bidang fokus",
      "a11y.scrollhint": "Gulir ke bagian tentang",
      "lang.toggle.aria": "Ganti bahasa",
      "nav.toggle.open": "Buka menu",
      "nav.toggle.close": "Tutup menu",
      "nav.about": "Tentang",
      "nav.nodes": "Node",
      "nav.stack": "Keahlian",
      "nav.journey": "Perjalanan",
      "nav.activities": "Aktivitas",
      "nav.projects": "Proyek",
      "nav.contact": "Kontak",
      "hero.badge": "Entusias Validator & Testnet",
      "hero.alias": "alias <span class=\"text-primary\">0xray</span>",
      "hero.tagline": "Mengamankan jaringan. Berburu peluang.<br />Mengoleksi budaya.",
      "hero.cta.github": "Lihat GitHub",
      "hero.cta.contact": "Hubungi Saya",
      "chip.airdrop": "Airdrop",
      "chip.testnet": "Testnet",
      "chip.nft": "NFT",
      "stats.networks": "Jaringan Diamankan",
      "stats.monitoring": "Pemantauan Node",
      "stats.repos": "Repositori Publik",
      "about.eyebrow": "Tentang",
      "about.title": "Pikiran infrastruktur,<br />jiwa web3.",
      "about.lead": "Saya Uray Fazli — operator node yang mengamankan jaringan <strong>Aptos</strong>, <strong>Sei</strong>, dan <strong>SubQuery</strong>. Di luar infrastruktur, saya aktif di dunia web3: berburu airdrop, menguji testnet, dan mengoleksi NFT.",
      "about.whatido": "Yang Saya Kerjakan",
      "about.w1": "Menjalankan infrastruktur validator & node di berbagai jaringan",
      "about.w2": "Ikut testnet sejak awal — menjalankan node, melaporkan bug, memberi masukan",
      "about.w3": "Memantau protokol baru untuk peluang airdrop secara sistematis",
      "about.w4": "Mengoleksi NFT dengan komunitas dan budaya yang bertahan",
      "about.background": "Latar Belakang",
      "about.b1": "Mengoperasikan infrastruktur validator yang membantu mengamankan jaringan",
      "about.b2": "Administrasi dan hardening server Linux",
      "about.b3": "Partisipasi testnet dan umpan balik protokol",
      "about.b4": "Riset on-chain dan pelacakan airdrop",
      "nodes.eyebrow": "Operasi Node",
      "nodes.title": "Menjalankan infrastruktur<br />yang diandalkan jaringan.",
      "nodes.desc": "Operasi validator dan node di tiga jaringan — menjaga chain tetap aman, terdesentralisasi, dan performan.",
      "role.validator": "Validator",
      "role.nodeop": "Operator Node",
      "nodes.aptos.title": "Jaringan Aptos",
      "nodes.sei.title": "Jaringan Sei",
      "nodes.subquery.title": "Jaringan SubQuery",
      "nodes.aptos.text": "Mengoperasikan infrastruktur validator di Aptos — Layer 1 ber-throughput tinggi yang dibangun untuk adopsi massal.",
      "nodes.sei.text": "Menjalankan infrastruktur validator di Sei — Layer 1 paralel yang dirancang khusus untuk aplikasi trading berperforma tinggi.",
      "nodes.subquery.text": "Mengoperasikan infrastruktur indexing di SubQuery — menghadirkan data cepat dan andal untuk aplikasi web3.",
      "nodes.focus.label": "Fokus operasional:",
      "nodes.aptos.focus": "uptime & reliabilitas, pemantauan, upgrade jaringan.",
      "nodes.sei.focus": "tuning performa, pemantauan, partisipasi governance.",
      "nodes.subquery.focus": "performa indexing, reliabilitas data, optimasi query.",
      "tag.layer1": "Layer 1",
      "tag.bft": "Konsensus BFT",
      "tag.uptime": "Uptime & reliabilitas",
      "tag.monitoring": "Pemantauan",
      "tag.upgrades": "Upgrade jaringan",
      "tag.parallelized": "Paralel",
      "tag.perftune": "Tuning performa",
      "tag.governance": "Partisipasi governance",
      "tag.indexing": "Indexing",
      "tag.datainfra": "Data Infra",
      "tag.indexingperf": "Performa indexing",
      "tag.datarel": "Reliabilitas data",
      "tag.queryopt": "Optimasi query",
      "stack.eyebrow": "Keahlian",
      "stack.title": "Skill yang menjaga<br />node tetap berjalan.",
      "stack.desc": "Perangkat operasional di balik infrastruktur validator yang andal.",
      "stack.s1t": "Operasi Validator",
      "stack.s1d": "Menjalankan dan merawat node validator yang membantu mengamankan jaringan blockchain.",
      "stack.s2t": "Administrasi Server Linux",
      "stack.s2d": "Setup, konfigurasi, dan perawatan server Linux kelas produksi yang sudah di-hardening.",
      "stack.s3t": "Docker & Kontainerisasi",
      "stack.s3d": "Deployment node yang terisolasi dan mudah direproduksi dengan container dan alur compose.",
      "stack.s4t": "Monitoring & Alerting",
      "stack.s4d": "Health check dan alert sepanjang waktu untuk menangkap masalah sebelum membesar.",
      "stack.s5t": "Partisipasi Testnet",
      "stack.s5d": "Pengujian jaringan tahap awal, laporan bug, dan masukan yang menyempurnakan peluncuran mainnet.",
      "stack.s6t": "Riset On-chain",
      "stack.s6d": "Membaca data on-chain untuk menemukan tren, peluang, dan sinyal proyek.",
      "journey.eyebrow": "Perjalanan",
      "journey.title": "Posisi saya saat ini,<br />arah saya ke depan.",
      "journey.j1t": "Menjalankan infrastruktur validator",
      "journey.j1d": "Mengoperasikan node yang membantu mengamankan jaringan — uptime, upgrade, dan reliabilitas yang utama.",
      "journey.j2t": "Berekspansi lintas jaringan",
      "journey.j2d": "Aptos, Sei, dan SubQuery — operasi multi-jaringan yang dibangun dengan tooling dan kedisiplinan yang sama.",
      "journey.j3t": "Mendalami ekosistem",
      "journey.j3d": "Testnet, riset airdrop, dan koleksi NFT — tetap dekat dengan arah gerak web3.",
      "activities.eyebrow": "Aktivitas Web3",
      "activities.title": "Di garis depan.",
      "activities.desc": "Lebih dari sekadar menjalankan node — berpartisipasi aktif dalam ekosistem, dari testnet awal hingga budaya on-chain.",
      "act.a1t": "Pemburu Airdrop",
      "act.a1d": "Memantau protokol baru, menyelesaikan quest, dan mengambil posisi lebih awal — secara sistematis, bukan asal-asalan. Aktivitas on-chain lintas jaringan, terdokumentasi dan dapat diulang.",
      "act.a2t": "Partisipan Testnet",
      "act.a2d": "Menguji jaringan sebelum mainnet — menjalankan node, melaporkan bug, dan memberi masukan yang benar-benar dipakai. Datang lebih awal karena memang dirancang begitu, teliti karena sudah kebiasaan.",
      "act.a3t": "Kolektor NFT",
      "act.a3d": "Mengoleksi budaya digital — dari foto profil hingga seni on-chain yang didukung komunitas yang bertahan lama. Kurasi karena keyakinan, bukan hype.",
      "projects.eyebrow": "Proyek",
      "projects.title": "Karya & eksperimen.",
      "projects.desc": "Tools dan bot untuk dunia web3 — pelacak on-chain, bot Telegram, dan perangkat testnet.",
      "proj.badge.tooling": "Perkakas",
      "proj.badge.experiments": "Eksperimen",
      "proj.badge.monitoring": "Pemantauan",
      "proj.p1d": "Perkakas untuk melacak partisipasi testnet — tetap rapi lintas jaringan dan tugas.",
      "proj.p2d": "Eksperimen pelacakan on-chain Solana — memantau wallet dan aktivitas token.",
      "proj.p3d": "Radar & pemantau sinyal web3 — mengawasi pergerakan di dunia kripto.",
      "proj.tag.testnet": "Testnet",
      "proj.tag.tracking": "Pelacakan",
      "proj.tag.onchain": "On-chain",
      "proj.viewrepo": "Lihat repo →",
      "cta.title": "Lihat semua yang pernah saya buat",
      "cta.text": "Source code lengkap, eksperimen, dan proyek yang sedang berjalan ada di GitHub.",
      "contact.eyebrow": "Kontak",
      "contact.title": "Mari terhubung.",
      "contact.desc": "Terbuka untuk kolaborasi validator, program testnet, dan diskusi seputar web3.",
      "footer.note": "Didesain dengan bahasa desain Binance · Dibangun dengan vanilla HTML/CSS/JS"
    }
  };

  /* exposed for app.js (nav toggle aria-labels) */
  window.I18N = translations;
  if (typeof module !== 'undefined' && module.exports) module.exports = translations;

  var STORAGE_KEY = 'portfolio-lang';
  var DEFAULT_LANG = 'en';

  function getLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function applyLang(lang) {
    var dict = translations[lang] || translations[DEFAULT_LANG];
    document.documentElement.setAttribute('lang', lang === 'id' ? 'id' : 'en');
    if (dict['meta.title']) document.title = dict['meta.title'];
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict['meta.desc']) metaDesc.setAttribute('content', dict['meta.desc']);

    var els, i, key;
    els = document.querySelectorAll('[data-i18n]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n');
      if (dict[key] !== undefined) els[i].textContent = dict[key];
    }
    els = document.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n-html');
      if (dict[key] !== undefined) els[i].innerHTML = dict[key];
    }
    els = document.querySelectorAll('[data-i18n-aria]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n-aria');
      if (dict[key] !== undefined) els[i].setAttribute('aria-label', dict[key]);
    }

    els = document.querySelectorAll('.lang-toggle [data-lang]');
    for (i = 0; i < els.length; i++) {
      var active = els[i].getAttribute('data-lang') === lang;
      els[i].classList.toggle('is-active', active);
      els[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
  }

  function init() {
    applyLang(getLang());
    var btns = document.querySelectorAll('.lang-toggle [data-lang]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        applyLang(this.getAttribute('data-lang'));
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.setPortfolioLang = applyLang;
})();
