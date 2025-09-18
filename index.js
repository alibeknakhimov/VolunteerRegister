const express = require("express");
const path = require("path");
const admin = require("firebase-admin");

// Firebase Admin инициализация — с переменной окружения
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("❌ Не установлена переменная окружения GOOGLE_APPLICATION_CREDENTIALS");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Главная страница формы
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// Страница "Спасибо"
app.get("/thankyou", (req, res) => {
  res.sendFile(path.join(__dirname, "views/thankyou.html"));
});

// Обработка формы
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

    console.log(`✅ Новый волонтер: ${name} ${surname} (${email}, ${phone})`);

    const params = new URLSearchParams({ name, surname, email, phone });
    res.redirect(`/thankyou?${params.toString()}`);
  } catch (err) {
    console.error("❌ Ошибка Firestore:", err);
    res.status(500).send("Ошибка при сохранении данных.");
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер работает: http://localhost:${PORT}`);
  console.log("✔️ Используется GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
});
