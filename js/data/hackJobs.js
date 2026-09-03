export const hackJobs = [
  {
    id: "relay_trace",
    name: "Relay Trace",
    description: "Telusuri jejak node anonim untuk broker jaringan.",
    icon: "📡",
    reward: 250,
    heatGain: 4,
    risk: "low",
    duration: 16,
    required: { security: 1 },
    darkRepGain: 1,
    xp: 20
  },
  {
    id: "cache_intercept",
    name: "Cache Intercept",
    description: "Ambil paket data uji dari server rival fiktif.",
    icon: "🗃️",
    reward: 550,
    heatGain: 7,
    risk: "low",
    duration: 22,
    required: { security: 2 },
    darkRepGain: 2,
    xp: 30
  },
  {
    id: "ghost_api",
    name: "Ghost API",
    description: "Temukan jalur tersembunyi pada API milik klien anonim.",
    icon: "👻",
    reward: 1100,
    heatGain: 10,
    risk: "medium",
    duration: 28,
    required: { security: 3 },
    darkRepGain: 3,
    xp: 45,
    moralChoice: true
  },
  {
    id: "mirror_node",
    name: "Mirror Node",
    description: "Alihkan salinan data melalui jaringan bayangan.",
    icon: "🪞",
    reward: 1900,
    heatGain: 13,
    risk: "medium",
    duration: 34,
    required: { security: 4 },
    darkRepGain: 4,
    xp: 60
  },
  {
    id: "vault_recovery",
    name: "Vault Recovery",
    description: "Pulihkan kunci digital yang diklaim hilang oleh pemiliknya.",
    icon: "🔐",
    reward: 3000,
    heatGain: 16,
    risk: "medium",
    duration: 42,
    required: { security: 5 },
    darkRepGain: 5,
    xp: 75,
    moralChoice: true
  },
  {
    id: "market_shadow",
    name: "Market Shadow",
    description: "Salin intel pasar dari konsorsium teknologi bawah tanah.",
    icon: "📊",
    reward: 4800,
    heatGain: 20,
    risk: "high",
    duration: 50,
    required: { security: 6 },
    darkRepGain: 7,
    xp: 95
  },
  {
    id: "rival_blackout",
    name: "Rival Blackout",
    description: "Ganggu simulasi jaringan perusahaan rival untuk satu siklus.",
    icon: "🌑",
    reward: 7200,
    heatGain: 24,
    risk: "high",
    duration: 58,
    required: { security: 7 },
    darkRepGain: 9,
    xp: 120
  },
  {
    id: "cipher_ledger",
    name: "Cipher Ledger",
    description: "Buka ledger terenkripsi dan tentukan nasib temuannya.",
    icon: "📓",
    reward: 11000,
    heatGain: 28,
    risk: "high",
    duration: 66,
    required: { security: 8 },
    darkRepGain: 11,
    xp: 150,
    moralChoice: true
  },
  {
    id: "phantom_protocol",
    name: "Phantom Protocol",
    description: "Jalankan kontrak berisiko pada server korporasi fiktif.",
    icon: "🕶️",
    reward: 16500,
    heatGain: 34,
    risk: "extreme",
    duration: 76,
    required: { security: 9 },
    darkRepGain: 14,
    xp: 190
  },
  {
    id: "apex_auction",
    name: "Apex Auction",
    description: "Rebut artefak digital langka sebelum dilelang di dark market.",
    icon: "💠",
    reward: 25000,
    heatGain: 40,
    risk: "extreme",
    duration: 90,
    required: { security: 10 },
    darkRepGain: 18,
    xp: 250,
    moralChoice: true
  }
];

export const hackTools = [
  {
    id: "phantom_proxy",
    name: "Phantom Proxy",
    icon: "🛡️",
    cost: 8,
    description: "Mengurangi Heat dari setiap job sebesar 22%.",
    consumable: false
  },
  {
    id: "cipher_kit",
    name: "Cipher Kit",
    icon: "🔏",
    cost: 15,
    description: "Mempercepat penurunan Heat saat tidak ada job aktif.",
    consumable: false
  },
  {
    id: "fake_identity",
    name: "Fake Identity Kit",
    icon: "🎭",
    cost: 24,
    description: "Memperkecil peluang identitas terbongkar saat tertangkap.",
    consumable: false
  },
  {
    id: "zero_day",
    name: "Zero-Day Token",
    icon: "🧬",
    cost: 30,
    description: "Sekali pakai. Minigame job berikutnya otomatis sukses.",
    consumable: true
  }
];

export const riskLabels = {
  low: "RENDAH",
  medium: "SEDANG",
  high: "TINGGI",
  extreme: "EKSTREM"
};
