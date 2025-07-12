const express = require('express');
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authroutes");
const cardsRoutes = require("./routes/cards");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cards", cardsRoutes);

app.get("/home", (req, res) => {
    res.send("Hello World Express Js");
});

app.listen(3000, () => console.log("¡Servidor encendido en http://localhost:3000!"));

module.exports = app; 
