// bilgisayar kapalıyken de otomasyonu çalıştırmak için 
require("dotenv").config();

// otomasyon için gerekli olan kütüphane:
const cron = require("node-cron");


const express = require("express");
const cors = require("cors");

const app = express();

/* =========================
   1️⃣ GENEL MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   2️⃣ API KEY
========================= */
const API_KEY = process.env.API_KEY;

/* =========================
   3️⃣ SADECE BİTRIX ENDPOINTLERİNİ KORU
========================= */
app.use("/bitrix", (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  console.log("GELEN API KEY:", apiKey); // debug

  if (apiKey !== API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Yetkisiz erişim"
    });
  }

  next();
});

/* =========================
   4️⃣ ROUTE’LAR
========================= */

// Test endpoint (AÇIK)
app.get("/", (req, res) => {
  res.send("Node API çalışıyor");
});

/* 🔹 Bitrix LEAD ekleme */
app.post("/bitrix/lead-ekle", async (req, res) => {
  try {
    console.log("FORMDAN GELEN BODY:", req.body);

    const { title, name, lastName, phone } = req.body;

    if (!title || !name || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Eksik alan var"
      });
    }

    const webhookUrl =
      process.env.BITRIX_WEBHOOK;

    const bitrixUrl =
      `${webhookUrl}crm.lead.add.json` +
      `?fields[TITLE]=${encodeURIComponent(title)}` +
      `&fields[NAME]=${encodeURIComponent(name)}` +
      `&fields[LAST_NAME]=${encodeURIComponent(lastName)}` +
      `&fields[PHONE][0][VALUE]=${encodeURIComponent(phone)}` +
      `&fields[PHONE][0][VALUE_TYPE]=WORK`;

    const response = await fetch(bitrixUrl);
    const data = await response.json();

    res.json({
      success: true,
      bitrixResult: data
    });

  } catch (error) {
    console.error("LEAD HATASI:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* 🔹 Bitrix DEAL ekleme */
app.post("/bitrix/deal-ekle", async (req, res) => {
  try {
    const { title, amount } = req.body;

    if (!title || !amount) {
      return res.status(400).json({
        success: false,
        message: "Eksik alan var"
      });
    }

    const webhookUrl =
      "https://quickpoint.bitrix24.com.tr/rest/6816/d51qs251cgwxc6r5/";

    const bitrixUrl =
      `${webhookUrl}crm.deal.add.json` +
      `?fields[TITLE]=${encodeURIComponent(title)}` +
      `&fields[STAGE_ID]=NEW` +
      `&fields[CATEGORY_ID]=0` +
      `&fields[OPPORTUNITY]=${encodeURIComponent(amount)}` +
      `&fields[CURRENCY_ID]=TRY`;

    const response = await fetch(bitrixUrl);
    const data = await response.json();

    res.json({
      success: true,
      bitrixResult: data
    });

  } catch (error) {
    console.error("DEAL HATASI:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

//OTOMASYON

cron.schedule("* * * * *", async () => {
  console.log("⏰ Otomasyon çalıştı");

  const webhookUrl =
    "https://quickpoint.bitrix24.com.tr/rest/6816/d51qs251cgwxc6r5/";

  const bitrixUrl =
    `${webhookUrl}crm.lead.add.json` +
    `?fields[TITLE]=Otomatik%20Lead` +
    `&fields[NAME]=Cron` +
    `&fields[LAST_NAME]=Job`;

  try {
    const response = await fetch(bitrixUrl);
    const data = await response.json();
    console.log("✅ Otomatik Lead ID:", data.result);
  } catch (err) {
    console.error("❌ Otomasyon hatası:", err.message);
  }
});



/* =========================
   5️⃣ SERVER bunu render uyumlu olmadığı sabit olduğu için kaldırdık
========================= */
/*app.listen(3000, () => {
  console.log("API çalışıyor: http://localhost:3000");
}); */


/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API çalışıyor. Port: ${PORT}`);
});

