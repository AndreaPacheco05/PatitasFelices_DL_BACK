const express = require('express');
const app = express();
const cors = require("cors")

app.use(express.json())
app.use(cors())

app.listen(3000, console.log("¡Servidor encendido!"))

app.get("/home", (req, res) => {
    res.send("Hello World Express Js")
})

app.get("/tienda", (req, res) => {
    
})