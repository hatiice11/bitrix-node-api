/**
 * 🔁 Rastgele yenileme kararı endpoint'i
 * Tek ekran için tasarlandı
 */
app.get("/refresh-decision", (req, res) => {
  // dakika cinsinden alt / üst sınır
  const MIN_MINUTES = 10;
  const MAX_MINUTES = 20;

  // rastgele dakika
  const randomMinutes =
    Math.floor(Math.random() * (MAX_MINUTES - MIN_MINUTES + 1)) + MIN_MINUTES;

  const nextCheckInSeconds = randomMinutes * 60;

  // %70 ihtimalle yenile
  const refresh = Math.random() < 0.7;

  // %50 ihtimalle ses çal
  const playSound = Math.random() < 0.5;

  const titles = [
    "🔄 Kontrol ediliyor...",
    "👀 Yeni müşteri olabilir",
    "⏳ Güncelleniyor",
    "📡 Sistem kontrolü"
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];

  res.json({
    refresh,
    playSound,
    title,
    nextCheckInSeconds
  });
});
