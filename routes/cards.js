const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

//aqui deben cambiar a su usuario y contraseña para que les funcione, este es el mío
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "patitasfelices",
    password: "0407AE",
    port: 5432,
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM productos");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

module.exports = router;
