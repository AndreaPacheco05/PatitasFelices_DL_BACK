const express = require('express');
const cors = require("cors");
const app = express();

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

app.get("/home", (req, res) => {
    res.send("Hello World Express Js");
});

app.listen(3000, () => console.log("¡Servidor encendido en http://localhost:3000!"));

module.exports = app; 
