const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const SECRET_KEY = require("../secretKey");

//aqui deben cambiar a su usuario y contraseña para que les funcione, este es el mío
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "patitasfelices",
    password: "0407AE",
    port: 5432,
});

router.post("/registrar", async (req, res) => {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
        "INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING *",
        [email, hash]
    );
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, email });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, email });
    } catch (error) {
        res.status(500).json({ error: "Error en login" });
    }
});

router.get("/me", (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "Token no proporcionado" });

    const token = auth.split(" ")[1];
    try {
        const data = jwt.verify(token, SECRET_KEY);
        res.json({ email: data.email });
    } catch (error) {
        res.status(403).json({ error: "Token inválido" });
    }
});

module.exports = router;
