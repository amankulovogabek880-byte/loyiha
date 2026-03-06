const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const publicPath = path.join(__dirname, "public");
const dataPath = path.join(__dirname, "data");
const bookingsPath = path.join(dataPath, "bookings.json");
const destinationsPath = path.join(dataPath, "destinations.json");

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath);
}

if (!fs.existsSync(bookingsPath)) {
  fs.writeFileSync(bookingsPath, "[]");
}

function readJson(filePath, fallback = []) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function validateBooking(body) {
  const {
    tripType,
    travelers,
    classType,
    from,
    to,
    departure,
    email,
    name,
    phone
  } = body;

  if (
    !tripType ||
    !travelers ||
    !classType ||
    !from ||
    !to ||
    !departure ||
    !email ||
    !name ||
    !phone
  ) {
    return "Barcha majburiy maydonlarni to‘ldiring.";
  }

  if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
    return "Jo‘nash va borish joyi bir xil bo‘lishi mumkin emas.";
  }

  return null;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

app.get("/api/destinations", (req, res) => {
  const destinations = readJson(destinationsPath, []);
  res.json({
    success: true,
    data: destinations
  });
});

app.get("/api/destinations/:id", (req, res) => {
  const id = Number(req.params.id);
  const destinations = readJson(destinationsPath, []);
  const item = destinations.find((d) => d.id === id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Manzil topilmadi."
    });
  }

  res.json({
    success: true,
    data: item
  });
});

app.post("/api/bookings", (req, res) => {
  const error = validateBooking(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error
    });
  }

  const bookings = readJson(bookingsPath, []);

  const newBooking = {
    id: Date.now(),
    tripType: req.body.tripType.trim(),
    travelers: req.body.travelers.trim(),
    classType: req.body.classType.trim(),
    from: req.body.from.trim(),
    to: req.body.to.trim(),
    departure: req.body.departure,
    returnDate: req.body.returnDate || "",
    email: req.body.email.trim(),
    name: req.body.name.trim(),
    phone: req.body.phone.trim(),
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);
  writeJson(bookingsPath, bookings);

  res.status(201).json({
    success: true,
    message: "So‘rovingiz muvaffaqiyatli yuborildi.",
    data: newBooking
  });
});

app.get("/api/bookings", (req, res) => {
  const bookings = readJson(bookingsPath, []);
  res.json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

app.delete("/api/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  const bookings = readJson(bookingsPath, []);
  const exists = bookings.some((item) => item.id === id);

  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Buyurtma topilmadi."
    });
  }

  const filtered = bookings.filter((item) => item.id !== id);
  writeJson(bookingsPath, filtered);

  res.json({
    success: true,
    message: "Buyurtma o‘chirildi."
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/destination", (req, res) => {
  res.sendFile(path.join(publicPath, "destination.html"));
});

app.listen(PORT, () => {
  console.log(`Server ishladi: http://localhost:${PORT}`);
});