const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const SECRET_KEY = require("../secretKey");
const { verificarToken } = require("../middlewares")
const {agregarPublicacion, modificarUsuario} = require("../consultas")

//aqui deben cambiar a su usuario y contraseña para que les funcione, este es el mío
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "patitasfelices",
  password: "tiago123",
  port: 5432,
});

router.post("/registrar", async (req, res) => {
  const { nombre, email, password, direccion, telefono, imgPerfil_url } =
    req.body;
 /*  console.log(req.body) */
  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, direccion, telefono, imgPerfil_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [nombre, email, hash, direccion, telefono, imgPerfil_url]
    );
    const user = result.rows[0]
    const token = jwt.sign({id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, email });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

router.post("/login",async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, email });
  } catch (error) {
    res.status(500).json({ error: "Error en login" });
  }
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    console.log("token no proporcionado")
    return res.status(401).json({ error: "Token no proporcionado" });
  }
    

  const token = auth.split(" ")[1];
  try {
    const data = jwt.verify(token, SECRET_KEY);
    /* console.log("token decodificado", data) */
    const result = await pool.query("SELECT nombre, email, direccion, telefono, imgPerfil_url FROM USUARIOS WHERE email = $1",
      [data.email])
    if (result.rows.length === 0) {
      console.log("Usuario no encontrado")
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
  res.json(result.rows[0])
  } catch (error) {
    console.log("Error en /me", error.message)
    res.status(403).json({ error: "Token inválido" });
  }
});

router.put("/usuarios/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, direccion, telefono, imgperfil_url } = req.body;
  
    if (parseInt(id) !== req.usuario.id) {
      return res.status(403).json({ error: "No tienes permiso para modificar este usuario" });
    }
  
    try {
      const usuarioActualizado = await modificarUsuario(id, nombre, email, direccion, telefono, imgperfil_url);
      res.status(200).json({ mensaje: "Usuario actualizado correctamente", usuario: usuarioActualizado });
    } catch ({ code, message }) {
      res.status(code || 500).json({ error: message });
    }
});
  
router.post("/publicacion", verificarToken, agregarPublicacion);

module.exports = router;
