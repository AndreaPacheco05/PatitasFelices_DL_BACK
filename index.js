const express = require('express');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;


const authRoutes = require("./routes/authroutes");
const cardsRoutes = require("./routes/cards");

const fs = require("fs");
const path = require("path");

const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cards", cardsRoutes);
app.use("/uploads", express.static("uploads"));


app.get("/home", (req, res) => {
    res.send("Hello World Express Js");
});

app.listen(PORT, () => console.log(`¡Servidor encendido en http://localhost:${PORT}`));

module.exports = app; 
