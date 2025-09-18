const express = require("express");
const path = require("path");
const admin = require("firebase-admin");

let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = admin.credential.cert(serviceAccount);
  } catch (err) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT_JSON содержит невалидный JSON");
    process.exit(1);
  }
} else {
  console.error("❌ Переменная окружения FIREBASE_SERVICE_ACCOUNT_JSON не установлена");
  process.exit(1);
}

admin.initializeApp({ credential });

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.get("/thankyou", (req, res) => {
  res.sendFile(path.join(__dirname, "views/thankyou.html"));
});

app.post("/submit", async (req, res) => {
  const { name, surname, email, phone } = req.body;

  try {
    await db.collection("volunteers").add({
      name,
      surname,
      email,
      phone,
      eventName: "Backstreet Boys Concert 2025",
      status: "new",
      comeIn: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Новый волонтер: ${name} ${surname}`);
    const params = new URLSearchParams({ name, surname, email, phone });
    res.redirect(`/thankyou?${params.toString()}`);
  } catch (err) {
    console.error("❌ Ошибка Firestore:", err);
    res.status(500).send("Ошибка при сохранении данных.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер работает: http://localhost:${PORT}`);
});
